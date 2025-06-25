import Map "mo:base/HashMap";
import Text "mo:base/Text";
import Time "mo:base/Time";
import Array "mo:base/Array";
import Result "mo:base/Result";
import Int "mo:base/Int";
import Iter "mo:base/Iter";

actor KYCVault {

  // Types
  type KYCStatus = {
    #Pending;
    #Approved;
    #Rejected;
  };

  type UserProfile = {
    id : Text;
    email : Text;
    fullName : Text;
    dateOfBirth : Text;
    country : Text;
    documentUrl : Text;
    status : KYCStatus;
    submittedAt : Int;
    reviewedAt : ?Int;
    reviewComments : ?Text;
    password : Text;
  };

  type VerificationCode = {
    code : Text;
    userId : Text;
    createdAt : Int;
    expiresAt : Int;
    used : Bool;
  };

  // Storage
  private stable var userEntries : [(Text, UserProfile)] = [];
  private stable var codeEntries : [(Text, VerificationCode)] = [];
  private stable var adminEntries : [(Text, Text)] = [];

  private var users = Map.HashMap<Text, UserProfile>(
    10,
    Text.equal,
    Text.hash,
  );

  private var admins = Map.HashMap<Text, Text>(
    10,
    Text.equal,
    Text.hash,
  );

  private var verificationCodes = Map.HashMap<Text, VerificationCode>(
    10,
    Text.equal,
    Text.hash,
  );

  func initializeAdmin() {
    switch (admins.get("admin@kycvault.com")) {
      case (?_) { /* Admin already exists */ };
      case null {
        admins.put("admin@kycvault.com", "admin123");
      };
    };
  };

  // Helper function to generate random code
  func generateRandomCode() : Text {
    let timestamp = Int.abs(Time.now());
    "KYC" # Int.toText(timestamp % 1000000);
  };

  // Initialize data from stable variables
  func initialize() {
    // Add user entries
    for ((k, v) in userEntries.vals()) {
      users.put(k, v);
    };

    // Add admin entries
    for ((k, v) in adminEntries.vals()) {
      admins.put(k, v);
    };

    // Add verification code entries
    for ((k, v) in codeEntries.vals()) {
      verificationCodes.put(k, v);
    };

    initializeAdmin();
  };

  public func initializeSystem() : async () {
    initialize();
  };


  // User Functions
  public func registerUser(email : Text, _password : Text) : async Result.Result<Text, Text> {
    switch (users.get(email)) {
      case (?_) {
        #err("User already exists");
      };
      case null {
        let userId = email; // Using email as ID for simplicity
        let user : UserProfile = {
          id = userId;
          email = email;
          fullName = "";
          dateOfBirth = "";
          country = "";
          documentUrl = "";
          status = #Pending;
          submittedAt = Time.now();
          reviewedAt = null;
          reviewComments = null;
          password = _password;
        };
        users.put(email, user);
        #ok("User registered successfully");
      };
    };
  };

  public func submitKYC(
    email : Text,
    fullName : Text,
    dateOfBirth : Text,
    country : Text,
    documentUrl : Text,
  ) : async Result.Result<Text, Text> {
    switch (users.get(email)) {
      case (?user) {
        let updatedUser : UserProfile = {
          id = user.id;
          email = user.email;
          fullName = fullName;
          dateOfBirth = dateOfBirth;
          country = country;
          documentUrl = documentUrl;
          status = #Pending;
          submittedAt = Time.now();
          reviewedAt = null;
          reviewComments = null;
          password = user.password;
        };
        users.put(email, updatedUser);

        // Generate and store verification code
        let code = generateRandomCode();
        let verificationCode : VerificationCode = {
          code = code;
          userId = user.id;
          createdAt = Time.now();
          expiresAt = Time.now() + (24 * 60 * 60 * 1000_000_000); // 24 hours
          used = false;
        };
        verificationCodes.put(code, verificationCode);

        #ok(code); // Return the code!
      };
      case null {
        #err("User not found");
      };
    };
  };

  public query func getUserProfile(email : Text) : async Result.Result<UserProfile, Text> {
    switch (users.get(email)) {
      case (?user) { #ok(user) };
      case null { #err("User not found") };
    };
  };

  // Admin Functions
  public func adminLogin(email : Text, password : Text) : async Result.Result<Text, Text> {
    switch (admins.get(email)) {
      case (?storedPassword) {
        if (storedPassword == password) {
          #ok("Login successful");
        } else {
          #err("Invalid credentials");
        };
      };
      case null {
        #err("Admin not found");
      };
    };
  };

  // User Authentication
  public func userLogin(email : Text, _password : Text) : async Result.Result<Text, Text> {
  switch (users.get(email)) {
    case (?user) {
      if (user.password == _password) {
        #ok("Login successful");
      } else {
        #err("Incorrect password");
      };
    };
    case null {
      #err("User not found");
    };
  };
};


  public query func getPendingKYCs() : async [UserProfile] {
    let allUsers = users.vals();
    Array.filter<UserProfile>(
      Iter.toArray(allUsers),
      func(user) {
        switch (user.status) {
          case (#Pending) { true };
          case (_) { false };
        };
      },
    );
  };

  public query func getAllUsers() : async [UserProfile] {
    Iter.toArray(users.vals());
  };

  public func approveKYC(userEmail : Text, comments : ?Text) : async Result.Result<Text, Text> {
    switch (users.get(userEmail)) {
      case (?user) {
        let updatedUser : UserProfile = {
          id = user.id;
          email = user.email;
          fullName = user.fullName;
          dateOfBirth = user.dateOfBirth;
          country = user.country;
          documentUrl = user.documentUrl;
          status = #Approved;
          submittedAt = user.submittedAt;
          reviewedAt = ?Time.now();
          reviewComments = comments;
          password = user.password;
        };
        users.put(userEmail, updatedUser);
        #ok("KYC approved successfully");
      };
      case null {
        #err("User not found");
      };
    };
  };

  public func rejectKYC(userEmail : Text, comments : ?Text) : async Result.Result<Text, Text> {
    switch (users.get(userEmail)) {
      case (?user) {
        let updatedUser : UserProfile = {
          id = user.id;
          email = user.email;
          fullName = user.fullName;
          dateOfBirth = user.dateOfBirth;
          country = user.country;
          documentUrl = user.documentUrl;
          status = #Rejected;
          submittedAt = user.submittedAt;
          reviewedAt = ?Time.now();
          reviewComments = comments;
          password = user.password;
        };
        users.put(userEmail, updatedUser);
        #ok("KYC rejected successfully");
      };
      case null {
        #err("User not found");
      };
    };
  };

  // Verification Code Functions
  public func generateVerificationCode(userEmail : Text) : async Result.Result<Text, Text> {
    switch (users.get(userEmail)) {
      case (?user) {
        switch (user.status) {
          case (#Approved) {
            let code = generateRandomCode();
            let verificationCode : VerificationCode = {
              code = code;
              userId = user.id;
              createdAt = Time.now();
              expiresAt = Time.now() + (24 * 60 * 60 * 1000_000_000); // 24 hours in nanoseconds
              used = false;
            };
            verificationCodes.put(code, verificationCode);
            #ok(code);
          };
          case (_) {
            #err("User KYC not approved");
          };
        };
      };
      case null {
        #err("User not found");
      };
    };
  };

  public func verifyCode(code : Text) : async Result.Result<{ verified : Bool; userInfo : ?{ fullName : Text; country : Text } }, Text> {
    switch (verificationCodes.get(code)) {
      case (?verificationCode) {
        if (verificationCode.used) {
          #err("Verification code already used");
        } else if (Time.now() > verificationCode.expiresAt) {
          #err("Verification code expired");
        } else {
          // Mark code as used
          let updatedCode : VerificationCode = {
            code = verificationCode.code;
            userId = verificationCode.userId;
            createdAt = verificationCode.createdAt;
            expiresAt = verificationCode.expiresAt;
            used = true;
          };
          verificationCodes.put(code, updatedCode);

          // Get user info
          switch (users.get(verificationCode.userId)) {
            case (?user) {
              #ok({
                verified = true;
                userInfo = ?{
                  fullName = user.fullName;
                  country = user.country;
                };
              });
            };
            case null {
              #ok({
                verified = true;
                userInfo = null;
              });
            };
          };
        };
      };
      case null {
        #err("Invalid verification code");
      };
    };
  };

  // System functions for upgrades
  system func preupgrade() {
    userEntries := Iter.toArray(users.entries());
    adminEntries := Iter.toArray(admins.entries());
    codeEntries := Iter.toArray(verificationCodes.entries());
  };

  public shared({}) func init() : async () {
    initialize();
  };

  system func postupgrade() {
    // Re-initialize the HashMaps from stable storage
    initialize();
  };
}


