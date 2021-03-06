package net.revenj.server.commands.crud

import net.revenj.patterns.{AggregateRoot, DomainModel, PersistableRepository, ServiceLocator}
import net.revenj.serialization.Serialization
import net.revenj.server.commands.Utils
import net.revenj.server.commands.crud.Update.Argument
import net.revenj.server.{CommandResult, ServerCommand}

import scala.concurrent.Future

class Update(domainModel: DomainModel) extends ServerCommand {

  override def execute[TInput, TOutput](
    locator: ServiceLocator,
    input: Serialization[TInput],
    output: Serialization[TOutput],
    data: TInput): Future[CommandResult[TOutput]] = {

    val arg = input.deserializeRuntime(data, classOf[Argument[TInput]], data.getClass)
    lazy val manifest = domainModel.find(arg.get.Name)
    if (!arg.isSuccess) {
      CommandResult.badRequest(arg.failed)
    } else if (manifest.isEmpty) {
      CommandResult.badRequest(s"Unable to find specified domain object: ${arg.get.Name}")
    } else if (arg.get.Data == null) {
      CommandResult.badRequest("Data to create not specified.")
    } else if (!classOf[AggregateRoot].isAssignableFrom(manifest.get)) {
      CommandResult.badRequest(s"Specified type is not an aggregate root: ${arg.get.Name}")
    } else {
      val instance = input.deserializeRuntime[AggregateRoot](arg.get.Data, manifest.get)
      if (!instance.isSuccess) {
        CommandResult.badRequest(s"Error deserializing provided input for: ${arg.get.Name}. Reason: ${instance.failed.get.getMessage}")
      } else {
        val tryRepository = Utils.resolve(locator, classOf[PersistableRepository[AggregateRoot]], manifest.get)
        if (!tryRepository.isSuccess) {
          CommandResult.badRequest(s"Error resolving repository for: ${arg.get.Name}. Reason: ${tryRepository.failed.get.getMessage}")
        } else {
          import scala.concurrent.ExecutionContext.Implicits.global
          tryRepository.get.find(arg.get.Uri).flatMap {
            case Some(found) =>
              tryRepository.get.update(found, instance.get).map { _ =>
                val response = output.serializeRuntime(found)
                if (response.isSuccess) {
                  CommandResult[TOutput](Some(response.get), "Object changed", 200)
                } else {
                  CommandResult[TOutput](None, response.failed.get.getMessage, 500)
                }
              }
            case _ =>
              CommandResult.badRequest(s"Can't find ${arg.get.Name} with uri: ${arg.get.Uri}")
          }
        }
      }
    }
  }
}

object Update {

  case class Argument[TFormat](Name: String, Uri: String, Data: TFormat, ReturnInstance: Option[Boolean])

}