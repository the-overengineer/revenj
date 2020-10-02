module demo {

  role USER_VIEW;
  role USER_CREATE;
  role USER_MANAGE;
  role USER_CHANGE_STATUS;

  role PACKAGE_VIEW;
  role PACKAGE_CREATE;
  role PACKAGE_MANAGE;
  role PACKAGE_CHANGE_STATUS;

  struct Address {
    String street;
    String zipCode;
    String city;
    String region;
    String country;
  }

  enum Gender {
    Male;
    Female;
    Other;
  }

  enum UserStatus {
    Active;
    Blocked;
    Deactivated;
  }

  mixin UserMixin {
    UUID       ID;
    String     firstName;
    String     lastName;
    String     email;
    Gender     gender;
    Address    address;
    UserStatus status;
    Timestamp? statusChangedOn;
  }

  struct UserVM {
    has mixin UserMixin;
  }

  struct SearchUsersFilter {
    String? firstName;
    String? lastName;
    String? email;
    UserStatus? status;
  }

  command LookupUser {
    UUID   id;
    UserVM user { server managed; }
  }

  command SearchUsers {
    SearchUsersFilter filter;
    List<UserVM>      users { server managed; }
  }

  command CreateUser {
    has mixin UserMixin;
    UUID          ID { server managed; }
    Timestamp?    statusChangedOn { server managed; }
    PackageStatus status { server managed; }
  }

  command EditUser {
    has mixin UserMixin;
    Timestamp?    statusChangedOn { server managed; }
    UserStatus    status { server managed; }
  }

  command MarkUserAsActive {
    UUID userID;
  }

  command MarkUserAsBlocked {
    UUID userID;
  }

  command MarkUserAsDeactivated {
    UUID userID;
  }

  enum PackageStatus {
    Pending { description 'Pending'; }
    InDeliver { description 'In Delivery'; }
    Delivered { description 'Delivered'; }
    ReturnedToSender { description 'Returned to Sender'; }
  }

  mixin PackageMixin {
    UUID          ID;
    Money         price;
    Decimal       weight;
    String?       owner;
    Text?         description;
    Address       deliverToAddress;
    Address?      returnAddress;
    Timestamp?    statusChangedOn;
    PackageStatus status;
  }

  struct PackageVM {
    has mixin PackageMixin;
  }

  command LookupPackage {
    UUID      id;
    PackageVM package { server managed; }
  }

  struct SearchPackagesFilter {
    Money?               minPrice;
    Money?               maxPrice;
    Decimal?             minWeight;
    Decimal?             maxWeight;
    List<PackageStatus>? statuses;
  }

  command SearchPackages {
    SearchPackagesFilter filter;
    List<PackageVM>      packages { server managed; }
  }

  command CreatePackage {
    has mixin PackageMixin;
    UUID          ID { server managed; }
    Timestamp?    statusChangedOn { server managed; }
    PackageStatus status { server managed; }
  }

  command EditPackage {
    has mixin PackageMixin;
    Timestamp?    statusChangedOn { server managed; }
    PackageStatus status { server managed; }
  }

  command MarkPackageInDelivery {
    UUID packageID;
  }

  command MarkPackageDelivered {
    UUID packageID;
  }

  command MarkPackageReturned {
    UUID packageID;
  }

  permissions {
    allow LookupUser for USER_VIEW;
    allow SearchUsers for USER_VIEW;
    allow CreateUser for USER_CREATE;
    allow EditUser for USER_MANAGE;
    allow MarkUserAsActive for USER_CHANGE_STATUS;
    allow MarkUserAsBlocked for USER_CHANGE_STATUS;
    allow MarkUserAsDeactivated for USER_CHANGE_STATUS;
    allow LookupPackage for PACKAGE_VIEW;
    allow SearchPackages for PACKAGE_VIEW;
    allow CreatePackage for PACKAGE_CREATE;
    allow EditPackage for PACKAGE_MANAGE;
    allow MarkPackageInDelivery for PACKAGE_CHANGE_STATUS;
    allow MarkPackageDelivered for PACKAGE_CHANGE_STATUS;
    allow MarkPackageReturned for PACKAGE_CHANGE_STATUS;
  }

  // ---- UI concepts ----
  item view Address {
    street 'Street and Number';
    zipCode 'Postal/Zip Code';
    city 'City';
    region 'Region/State';
    country 'Country';
  }

  group view UserBasicInformation 'Basic Information' for UserMixin {
    firstName 'First Name';
    lastName 'Last Name';
    gender 'Gender';
    email 'E-mail';
  }

  presenter CreateUser 'Enter User' {
    item view {
      use group view UserBasicInformation;
      group 'Address' {
        use address on item view Address;
      }
    }

    actions {
      save changes;
    }
  }

  presenter EditUser 'Manage User' {
    item view {
      use group view UserBasicInformation;
      group 'Address' {
        use address on item view Address;
      }
    }

    actions {
      change data;
      view switching;
    }
  }

  presenter SearchUsers 'Search Users' {
    filter from filter {
      firstName 'First Name';
      lastName 'Last Name';
      email 'E-mail';
      status 'User Status';
    }

    templater 'Export' 'Search Users';

    grid from users {
      ID 'ID';
      firstName 'First Name';
      lastName 'Last Name';
      email 'E-mail';
      status 'User Status';

      fast search;

      edit action EditUser;
      view action EditUser;
    }

    create action CreateUser;

    actions {
      navigation;
    }
  }

  group view PackageBasicInformation 'Basic Information' for PackageMixin {
    owner 'Package Owner';
    price 'Delivery price' {
      validation Typescript 'isPositive';
    }
    weight 'Weight (kg)' {
      validation Typescript 'isPositive';
      validation Typescript 'lessThan(500)';
    }
    description 'Description and Delivery Notes';
  }

  presenter CreatePackage 'Enter Package' {
    item view {
      use group view PackageBasicInformation;
      group 'Deliver To' {
        use deliverToAddress on item view Address;
      }
      group 'Return Address' {
        use returnAddress on item view Address;
      }
    }

    actions {
      save changes;
    }
  }

  presenter EditPackage 'Manage Package' {
    item view {
      use group view PackageBasicInformation;
      group 'Deliver To' {
        use deliverToAddress on item view Address;
      }
      // We only allow
      group 'Return Address' {
        use returnAddress on item view Address;
        properties { visibility 'this.context.visibility.hasReturnAddress'; }
      }
    }

    actions {
      change data;
      view switching;
    }
  }

  presenter SearchPackages 'Search Packages' {
    filter from filter {
      group 'Price' {
        minPrice 'From ($)';
        maxPrice 'To ($)';
      }
      group 'Weight' {
        minWeight 'From (kg)';
        maxWeight 'To (kg)';
      }
      statuses 'In Statuses';
    }

    templater 'Export' 'SearchPackages';

    grid from packages {
      ID 'Tracking Identifer';
      price 'Price';
      weight 'Weight (kg)';
      status 'Package Status';
      description 'Notes';

      fast search;

      edit action EditPackage;
      view action EditPackage;
    }

    create action CreatePackage;

    actions {
      navigation;
    }
  }
}
