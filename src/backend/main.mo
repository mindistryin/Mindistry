import Array "mo:core/Array";
import Map "mo:core/Map";
import Order "mo:core/Order";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Iter "mo:core/Iter";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import MixinStorage "blob-storage/Mixin";
import Storage "blob-storage/Storage";

actor {
  module Task {
    public func compareByDueDate(task1 : Task, task2 : Task) : Order.Order {
      Int.compare(task1.dueDate, task2.dueDate);
    };
  };

  // Extend with components
  include MixinStorage();

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // Types
  public type UserProfile = {
    name : Text;
  };

  public type Subject = {
    id : Text;
    name : Text;
    color : Text;
    createdAt : Int;
  };

  public type Task = {
    id : Text;
    title : Text;
    description : Text;
    subjectId : ?Text;
    dueDate : Int;
    priority : Priority;
    completed : Bool;
    createdAt : Int;
    updatedAt : Int;
  };

  public type Priority = {
    #low;
    #medium;
    #high;
  };

  public type StudyMaterial = {
    id : Text;
    title : Text;
    content : Text;
    subjectId : ?Text;
    tags : [Text];
    createdAt : Int;
    updatedAt : Int;
  };

  public type FileMeta = {
    id : Text;
    fileName : Text;
    fileType : Text;
    fileSize : Nat;
    subjectId : ?Text;
    uploadedAt : Int;
    blob : Storage.ExternalBlob;
  };

  public type UserData = {
    subjects : Map.Map<Text, Subject>;
    tasks : Map.Map<Text, Task>;
    materials : Map.Map<Text, StudyMaterial>;
    files : Map.Map<Text, FileMeta>;
  };

  // Storage
  let users = Map.empty<Principal, UserData>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  // User Profile Management
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Helper Functions
  func getUserData(caller : Principal) : UserData {
    switch (users.get(caller)) {
      case (null) {
        // Initialize if not exists
        let newUserData = {
          subjects = Map.empty<Text, Subject>();
          tasks = Map.empty<Text, Task>();
          materials = Map.empty<Text, StudyMaterial>();
          files = Map.empty<Text, FileMeta>();
        };
        users.add(caller, newUserData);
        newUserData;
      };
      case (?data) { data };
    };
  };

  // Subject Management
  public shared ({ caller }) func createSubject(name : Text, color : Text) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create subjects");
    };
    let id = name.concat(Time.now().toText());
    let subject : Subject = {
      id;
      name;
      color;
      createdAt = Time.now();
    };
    let userData = getUserData(caller);
    userData.subjects.add(id, subject);
    id;
  };

  public shared ({ caller }) func updateSubject(id : Text, name : Text, color : Text) : async Subject {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update subjects");
    };
    let userData = getUserData(caller);
    switch (userData.subjects.get(id)) {
      case (null) { Runtime.trap("Subject not found") };
      case (?existing) {
        let updated : Subject = {
          id;
          name;
          color;
          createdAt = existing.createdAt;
        };
        userData.subjects.add(id, updated);
        updated;
      };
    };
  };

  public shared ({ caller }) func deleteSubject(id : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete subjects");
    };
    let userData = getUserData(caller);
    userData.subjects.remove(id);
  };

  public query ({ caller }) func getSubjects() : async [Subject] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view subjects");
    };
    getUserData(caller).subjects.values().toArray();
  };

  // Task Management
  public shared ({ caller }) func createTask(title : Text, description : Text, subjectId : ?Text, dueDate : Int, priority : Priority) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create tasks");
    };
    let id = title.concat(Time.now().toText());
    let task : Task = {
      id;
      title;
      description;
      subjectId;
      dueDate;
      priority;
      completed = false;
      createdAt = Time.now();
      updatedAt = Time.now();
    };
    let userData = getUserData(caller);
    userData.tasks.add(id, task);
    id;
  };

  public shared ({ caller }) func updateTask(id : Text, title : Text, description : Text, subjectId : ?Text, dueDate : Int, priority : Priority, completed : Bool) : async Task {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update tasks");
    };
    let userData = getUserData(caller);
    switch (userData.tasks.get(id)) {
      case (null) { Runtime.trap("Task not found") };
      case (?existing) {
        let updated : Task = {
          id;
          title;
          description;
          subjectId;
          dueDate;
          priority;
          completed;
          createdAt = existing.createdAt;
          updatedAt = Time.now();
        };
        userData.tasks.add(id, updated);
        updated;
      };
    };
  };

  public shared ({ caller }) func deleteTask(id : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete tasks");
    };
    let userData = getUserData(caller);
    userData.tasks.remove(id);
  };

  public query ({ caller }) func getTasks() : async [Task] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view tasks");
    };
    getUserData(caller).tasks.values().toArray();
  };

  public query ({ caller }) func getTasksBySubject(subjectId : Text) : async [Task] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view tasks");
    };
    getUserData(caller).tasks.values().toArray().filter(func(t) { switch (t.subjectId) { case (?id) { id == subjectId }; case (null) { false } } });
  };

  public query ({ caller }) func getUpcomingTasks() : async [Task] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view tasks");
    };
    getUserData(caller).tasks.values().toArray().sort(Task.compareByDueDate).filter(func(t) { t.dueDate > Time.now() });
  };

  // Material Management
  public shared ({ caller }) func createMaterial(title : Text, content : Text, subjectId : ?Text, tags : [Text]) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create materials");
    };
    let id = title.concat(Time.now().toText());
    let material : StudyMaterial = {
      id;
      title;
      content;
      subjectId;
      tags;
      createdAt = Time.now();
      updatedAt = Time.now();
    };
    let userData = getUserData(caller);
    userData.materials.add(id, material);
    id;
  };

  public shared ({ caller }) func updateMaterial(id : Text, title : Text, content : Text, subjectId : ?Text, tags : [Text]) : async StudyMaterial {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update materials");
    };
    let userData = getUserData(caller);
    switch (userData.materials.get(id)) {
      case (null) { Runtime.trap("Material not found") };
      case (?existing) {
        let updated : StudyMaterial = {
          id;
          title;
          content;
          subjectId;
          tags;
          createdAt = existing.createdAt;
          updatedAt = Time.now();
        };
        userData.materials.add(id, updated);
        updated;
      };
    };
  };

  public shared ({ caller }) func deleteMaterial(id : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete materials");
    };
    let userData = getUserData(caller);
    userData.materials.remove(id);
  };

  public query ({ caller }) func getMaterials() : async [StudyMaterial] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view materials");
    };
    getUserData(caller).materials.values().toArray();
  };

  public query ({ caller }) func getMaterialsBySubject(subjectId : Text) : async [StudyMaterial] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view materials");
    };
    getUserData(caller).materials.values().toArray().filter(func(m) { switch (m.subjectId) { case (?id) { id == subjectId }; case (null) { false } } });
  };

  // File Management
  public shared ({ caller }) func addFile(fileName : Text, fileType : Text, fileSize : Nat, subjectId : ?Text, blob : Storage.ExternalBlob) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add files");
    };
    let id = fileName.concat(Time.now().toText());
    let file : FileMeta = {
      id;
      fileName;
      fileType;
      fileSize;
      subjectId;
      uploadedAt = Time.now();
      blob;
    };
    let userData = getUserData(caller);
    userData.files.add(id, file);
    id;
  };

  public shared ({ caller }) func deleteFile(id : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete files");
    };
    let userData = getUserData(caller);
    userData.files.remove(id);
  };

  public query ({ caller }) func getFiles() : async [FileMeta] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view files");
    };
    getUserData(caller).files.values().toArray();
  };

  public query ({ caller }) func getFilesBySubject(subjectId : Text) : async [FileMeta] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view files");
    };
    getUserData(caller).files.values().toArray().filter(func(f) { switch (f.subjectId) { case (?id) { id == subjectId }; case (null) { false } } });
  };
};
