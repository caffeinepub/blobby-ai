import Text "mo:core/Text";
import Order "mo:core/Order";
import Map "mo:core/Map";
import Array "mo:core/Array";
import Time "mo:core/Time";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";
import MixinStorage "blob-storage/Mixin";

actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);
  include MixinStorage();

  type UserProfile = {
    name : Text;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get profiles");
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

  type Message = {
    role : Text;
    content : Text;
    timestamp : Int;
  };

  type ChatSession = {
    id : Text;
    owner : Principal;
    taskType : Text;
    messages : [Message];
  };

  module ChatSession {
    public func compare(session1 : ChatSession, session2 : ChatSession) : Order.Order {
      Text.compare(session1.id, session2.id);
    };
  };

  let sessions = Map.empty<Text, ChatSession>();

  public shared ({ caller }) func createSession(id : Text, taskType : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create sessions");
    };
    if (sessions.containsKey(id)) { Runtime.trap("Session already exists") };
    let newSession = {
      id;
      owner = caller;
      taskType;
      messages = [];
    };
    sessions.add(id, newSession);
  };

  public query ({ caller }) func getSession(id : Text) : async ChatSession {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get sessions");
    };
    switch (sessions.get(id)) {
      case (null) { Runtime.trap("Session not found") };
      case (?session) {
        if (session.owner != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only access your own sessions");
        };
        session;
      };
    };
  };

  public shared ({ caller }) func saveMessage(sessionId : Text, role : Text, content : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save messages");
    };
    let session = switch (sessions.get(sessionId)) {
      case (null) { Runtime.trap("Session not found") };
      case (?found) { found };
    };

    if (session.owner != caller and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only save messages to your own sessions");
    };

    let newMessage = {
      role;
      content;
      timestamp = Time.now();
    };

    let updatedMessages = session.messages.concat([newMessage]);
    let newSession = { session with messages = updatedMessages };
    sessions.add(sessionId, newSession);
  };

  public query ({ caller }) func listSessions() : async [ChatSession] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can list sessions");
    };
    let isAdminCaller = AccessControl.isAdmin(accessControlState, caller);
    let filtered = if (isAdminCaller) {
      sessions.values().toArray();
    } else {
      sessions.values().toArray().filter(func(s : ChatSession) : Bool {
        s.owner == caller;
      });
    };
    filtered.sort();
  };

  public shared ({ caller }) func deleteSession(id : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete sessions");
    };
    switch (sessions.get(id)) {
      case (null) { Runtime.trap("Session not found") };
      case (?session) {
        if (session.owner != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only delete your own sessions");
        };
        sessions.remove(id);
      };
    };
  };
};
