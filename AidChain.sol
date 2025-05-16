// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

//Instructions///////////////////////////////////////////////////////////////////////////
//1. Deploy the DIDRegistry code first and extract that contract's address
//2. Add it in the AidToken deployment input along with the Relief agency address then deploy
//3. Then extract the AidToken contract address and use it for the AidTokenHandler

//Contract to manage decentralised identity roles (DID)
//So in a real life scenario this contract would be a accredited organisation
contract DIDRegistry {
    //--------------------LORE BEHIND IT--------------------
    //So in a user scenario, the user has to utilise the DID to and register
    //their address in their specific recipient role so when the AidToken Contract
    //is coming to assign the recipients it correctly correspond with the correct role
    //for that user that registered and not the wrong user (e.g., a user who signed
    //up as a transfer team shouldn't be assigned the role of ground relief).

    //***************************************IDEA***********************************************
    //Only other function that could be added is making it when the user registers it puts
    //in a location, and that location must align with all the other recipients in the assign
    //recipients function in the AidToken contract. I feel like adding this will make testing
    //a nightmare though.

    // Added: Store the relief agency address for access control
    address public reliefAgency;

    // Added: Constructor to set the relief agency address when deploying
    constructor(address _reliefAgency) {
        require(_reliefAgency != address(0), "Invalid relief agency address");
        reliefAgency = _reliefAgency;
    }

    // Added: Modifier to restrict access to relief agency only
    modifier onlyReliefAgency() {
        require(
            msg.sender == reliefAgency,
            "Only relief agency can call this function"
        );
        _;
    }

    //Enum to define the types of roles in the system
    //We will be strictly using these roles in our other contracts
    enum Role {
        None,
        Transporter,
        GroundRelief,
        Recipient
    }

    //Struct to store the DID string and role for each address
    struct DIDInfo {
        string did; //Unique DID string associated with the address (e.g., "transporter-0xABC123
        Role role; //Role asscoiated with this address (Transporter, GroundRelief, or Recipient)
        string location; //Human-readable location (e.g., "Fiji", "Port Moresby")
    }

    //mapping from address to its DID information (Forward lookup)
    mapping(address => DIDInfo) public dids;

    //Mapping from DID string to the associated address (for reverse lookup)
    mapping(string => address) public didToAddress; //Allows the lookup0 of the address associated with a particular DID string

    //Arrays to keep track of all addresses registered under each role
    address[] public transporterAddresses;
    address[] public groundReliefAddresses;
    address[] public recipientAddresses;

    //Added: Event to track role registrations
    event RoleRegistered(address indexed user, Role role, string location);

    //Internal registration function that assigns role-based DID automatically
    //So this is the internal helper function to register a user with a DID and role.
    //Appends a role prefix to the address to create a unique DID string.
    //Adds the user to the corresponding role array.
    //paramater user is the address being registered and we input this manually
    //roleString is the prefix to distinguish role type in the DID. So
    //like "transporter-" which is used in constructing the did.
    //parameter _role is the enum role to be assigned.
    function internalRegisterDID(
        address user,
        string memory roleString,
        Role _role,
        string memory _location
    ) internal {
        //Ensure a valid (non-zero) address. Preventing invalid entries
        require(user != address(0), "Invalid address");

        //Prevent double registration for the same address
        //Ensures this address hasn't been registered with a DID.
        //This checks whether the current address already has a non-empty DID string in the struct.
        //It works because the default string for uninitialised structs is empty.
        require(
            bytes(dids[user].did).length == 0,
            "Address already registered"
        );

        //Generate a unique DID using the role and user's address
        //So we generate a unique DID string by concatenating the role prefix with the hex representation of the address
        //Example: "transporter-0xd9145CCE52D386f254917e481eB449943F39138"
        //This ensures unique and self-descriptiveness of each DID.
        string memory autoDID = string(
            abi.encodePacked(roleString, toAsciiString(user))
        );

        //Ensure the generated DID is not already taken
        //Prevents duplication of DIDs even if another user manually tries to spoof it.
        require(didToAddress[autoDID] == address(0), "DID already in use");

        //Store the DID and role in the mapping for foward lookup.
        //DIDInfo struct is saved using the user address as the key
        dids[user] = DIDInfo(autoDID, _role, _location);

        //Store the same DID string in reverse-lookup mapping to retrieve the address by DID string
        //This allows querying the address from just the DID.
        didToAddress[autoDID] = user;

        //Append the user address to the appropriate role-specific list
        //These arrays are useful for rtreiving all registered users of a particular role
        if (_role == Role.Transporter) {
            transporterAddresses.push(user);
        } else if (_role == Role.GroundRelief) {
            groundReliefAddresses.push(user);
        } else if (_role == Role.Recipient) {
            recipientAddresses.push(user);
        }

        // Added: Emit event when a role is registered
        emit RoleRegistered(user, _role, _location);
    }

    // Modified: Added onlyReliefAgency modifier to restrict who can register transporters
    function registerTransporterDID(
        address user,
        string memory location
    ) public onlyReliefAgency {
        internalRegisterDID(user, "transporter-", Role.Transporter, location);
    }

    // Modified: Added onlyReliefAgency modifier to restrict who can register ground relief
    function registerGroundReliefDID(
        address user,
        string memory location
    ) public onlyReliefAgency {
        internalRegisterDID(user, "groundrelief-", Role.GroundRelief, location);
    }

    // Modified: Added onlyReliefAgency modifier to restrict who can register recipients
    function registerRecipientDID(
        address user,
        string memory location
    ) public onlyReliefAgency {
        internalRegisterDID(user, "recipient-", Role.Recipient, location);
    }

    //View function to return the role assigned to a specific address.
    //Enables off-chain systems or other contracts to verify access control.
    //The parameter is the user address to query.
    //Returns the role enum value assigned to that address.
    //This allows other contracts utilising functions making sure the correct role
    //is being assigned to that position
    function getRole(address user) public view returns (Role) {
        return dids[user].role;
    }

    function getLocation(address user) public view returns (string memory) {
        return dids[user].location;
    }

    //=====================================================
    //So the function takes an Ethereum address (user), a prefix string (expectedPrefix) like "transporter-"
    //Then looks up the DID string associated with that address. It compares the start of that DID string with the given prefix

    //Function to check whether the DID string for a given user starts with the expected role prefix
    //This adds a layer of semantic validation: not only must the user have a valid role enum,
    //but their DID string must follow the naming convention used during registration
    //eg., "transporter-0xABC...", "recipient-0xdEF...")
    function validateDIDPrefix(
        address user,
        string memory expectedPrefix
    ) public view returns (bool) {
        //Retrieve the did string associated with the provided address
        string memory userDID = dids[user].did;

        //Convert both user's DID and the expected prefix into byte arrays for character-by-character comparison
        bytes memory didBytes = bytes(userDID);
        bytes memory prefixBytes = bytes(expectedPrefix);

        //If the user's DID is shorter than the expected prefix, it can't possibly match = return false
        if (didBytes.length < prefixBytes.length) return false;

        //Loop through each byte of the expected prefix and compare it with the corresponding byte in the User's DID
        for (uint256 i = 0; i < prefixBytes.length; i++) {
            //If any character in the DID prefix doesn't match the expected prefix, return false
            if (didBytes[i] != prefixBytes[i]) return false;
        }

        //If all characters match up to the length of the expected prefix, return true
        //This means teh did is correctly prefiex (e.g., "transporter-" at the start_
        return true;
    }

    //Returns a list of all registered Transporter addresses.
    //Allows admins or interfaces to view all participants for this role.
    //Returns an array of Ethereum addresses assigned as transporters.
    function getAllTransporters() external view returns (address[] memory) {
        return transporterAddresses;
    }

    //Returns a list of all registered ground relief addresses.
    //Allows admins or interfaces to view all participants for this role.
    //Returns an array of Ethereum addresses assigned as ground-relief team.
    function getAllGroundRelief() external view returns (address[] memory) {
        return groundReliefAddresses;
    }

    //Returns a list of all registered recipient addresses.
    //Allows admins or interfaces to view all participants for this role.
    //Returns an array of Ethereum addresses assigned as recipients.
    function getAllRecipients() external view returns (address[] memory) {
        return recipientAddresses;
    }

    // Added: Function to transfer relief agency role to a new address
    // This allows for administrative changes if needed
    function transferReliefAgency(
        address newReliefAgency
    ) public onlyReliefAgency {
        require(
            newReliefAgency != address(0),
            "Invalid new relief agency address"
        );
        reliefAgency = newReliefAgency;
    }

    //==========================================================================
    //---------------------------Why we need toAsciiString----------------------
    //We need the toAsciiString function because Solidity doesn't let you easily convert an Ethereum
    //address (like 0xd914...) into a readable string. In our project we are automatically generating
    //decentralised identifiers (DIDs) by combining a role label like "transporter-" with the user's
    //aaddress in string form, creating something like "transporter-d9145cce523...". To do this,
    //toAsciiString takes each byte of the address, breaks it into two parts (called "nibbles"), and converts
    //each part into its corresponding character (like 'a', '5', 'f') - just like translating numbers into
    //hex. The helper char function does the actual conversion for each part. This process is important
    //because it guarantees that every DID is both unique (because Ethereum addresses are unique) and readable,
    //and can be used to link roles and look up registered users by DID.

    // Helper function to convert address to ASCII string
    //Converts an Ethereum address to a lowercase ASCII hex string (e.g., 0xABcD becomes "abcd").
    //This is useful for generating human-readable and unique DID strings tied to roles (e.g., "transporter-abc123..")
    //Solidity doesn't provide a native way to stringify address, so we implement this manually.

    function toAsciiString(address x) internal pure returns (string memory) {
        //Allocate a fixed-sized byte array of length 40 (each byte of an address becomes two hex characters)
        bytes memory s = new bytes(40);

        //Loop through each of the 20 bytes of the address
        for (uint256 i = 0; i < 20; i++) {
            //isolate the i-th byte from the address using bitwise math
            //(uint160(x) converts address to a uint, then we shift right and mask)
            bytes1 b = bytes1(
                uint8(uint256(uint160(x)) / (2 ** (8 * (19 - i))))
            );

            //Split the byte into high and low 4-bit halves (nibbles)
            bytes1 hi = bytes1(uint8(b) / 16); //Most significant nibble
            bytes1 lo = bytes1(uint8(b) - 16 * uint8(hi)); //Least significant nibble

            //Convert each nibble to its ASCII representation (0-9, a-f)
            s[2 * i] = char(hi); //first character
            s[2 * i + 1] = char(lo); //second character
        }
        //Return the concatenated ASCII string
        return string(s);
    }

    //Converts a single 4-bit value (0-15) into its ASCII hex character representation
    //Needed by toAsciiString to convert each nible into a character between '0' and 'f'.
    function char(bytes1 b) internal pure returns (bytes1 c) {
        //If the nibble is less than 10, return ASCII code for 0-9 (starts at 0x30)
        if (uint8(b) < 10) return bytes1(uint8(b) + 0x30);
        //If the nibble is 10-15, return ASCII codew for a-f (starts at 0x61 for 'a', but 0x57 works for lowercase)
        else return bytes1(uint8(b) + 0x57);
    }
}

//Main contract to manage aid tokens based on donor contributions
contract AidToken {
    DIDRegistry public didRegistry;

    //Address of the relief agency authorised to manage aid tokens and supply the aid
    address public reliefAgency;

    //Threshold donation amount required to issue an aid token
    uint256 public donationThreshold = 0.32 ether; //This is around $500 usd

    //So $50 usd transaction is 0.032 on 12/4/25
    //Minimum amount allowed per donation
    uint256 public minDonation = 0.013 ether; //This is around $20 usd.

    //Counter to asign unique IDs to each aid token
    uint256 public tokenIdCounter;

    //Tracks the total amount of donations for the currently active token
    uint256 public currentTokenBalance;

    //Added: Maximum number of tokens that can be processed in a single transaction to prevent gas limit issues
    uint256 public constant MAX_TOKENS_PER_TRANSACTION = 5;

    //Added: Event for tracking donations
    event Donation(address indexed donor, uint256 amount, uint256 tokenId);

    //Added: Event for tracking role assignments to tokens
    event AidTokenAssigned(
        uint256 indexed tokenId,
        address transferTeam,
        address groundRelief,
        address recipient
    );

    //This struct allows us to store details about each aid token
    struct AidTokenData {
        address[] donors; //List of donors/addresses contributing to this token
        uint256 donationAmount; //Total amount donated for this token
        address transferTeam; //Address of the team responsible for transporting aid
        address groundRelief; //Address of the local relief team
        address recipient; //Final recipient of the aid
        bool isIssued;
        bool isAssigned; //Tells us if is has passed the 500 threshold and can be deemed a token
        string location;
    }

    //Mapping from token ID to aid token data
    //Each tokenID (a unique identifier for each AidToken) maps to an AidTokenData struct
    //This allows us to store and retrieve all relevant information about each aid token,
    //including which donors contributed, total donation amount, and assigned stakeholders.
    mapping(uint256 => AidTokenData) public aidTokens;

    //Mapping from donor address to their total unallocated ballance
    //This keeps track of how much Ether a donor has contributed that hasn't yet been bundled
    //into a full aid token. This is useful if a donor contributes smaller ammounts
    //over time and to just check how much they have overall donated to the token/others
    //Once a token is issued and the donor's contribution is used in part of the process
    //the balance is updated still continously for future donations
    mapping(address => uint256) public donorBalances;

    //Event triggered when a new aid token is successfully issued
    event AidTokenIssued(uint256 tokenId, address[] donors);

    //Constructor sets the relief agency when the contract is deployed
    //They are essentially the first address on the contract and have all the power
    constructor(address _reliefAgency, address _didRegistry) {
        reliefAgency = _reliefAgency;
        didRegistry = DIDRegistry(_didRegistry);
    }

    //Modifier to restrict certain functions to only be called by the relief agency
    //They have owner control
    modifier onlyReliefAgency() {
        require(
            msg.sender == reliefAgency,
            "Only relief agency can call this function"
        );
        _;
    }

    //Modified: Optimized donate function to limit gas usage
    function donate() external payable {
        // Donation must be higher than 0.013 eth ($20 usd)
        require(msg.value >= minDonation, "Donation must be at least $20");

        // Update the donor's balance
        // Used to track the total donated amount by the sender across all tokens.
        // This is the running total, not tied to a specific token
        donorBalances[msg.sender] += msg.value;

        // Store the full Ether amount sent by the user in a variable named `remaining`.
        // This tracks how much of the donation still needs to be processed after each loop iteration.
        uint256 remaining = msg.value;

        // Added: Counter to limit the number of token creations in a single transaction
        uint256 tokenCount = 0;

        // This loop allows one donation to potentially fund multiple aid tokens.
        // It continues until the entire donated value (`remaining`) has been assigned to tokens
        // or until we've reached the maximum number of tokens per transaction.
        while (remaining > 0 && tokenCount < MAX_TOKENS_PER_TRANSACTION) {
            // Added: Increment token counter
            tokenCount++;

            // Calculate how much more Ether is needed to complete the current token.
            // For example, if the threshold is 0.32 ether and only 0.1 ether is already in the current token,
            // then spaceLeft would be 0.22 ether.
            uint256 spaceLeft = donationThreshold - currentTokenBalance;

            // Case 1: The remaining donation is enough to complete the current token.
            if (remaining >= spaceLeft) {
                // Add the current donor's address to the donor list of this token.
                aidTokens[tokenIdCounter].donors.push(msg.sender);

                // Only the exact amount needed to fill the token is added here.
                aidTokens[tokenIdCounter].donationAmount += spaceLeft;

                // Increase the running total of Ether stored in the current token.
                currentTokenBalance += spaceLeft;

                // Subtract the used amount from the remaining unallocated funds.
                remaining -= spaceLeft;

                // Added: Emit donation event
                emit Donation(msg.sender, spaceLeft, tokenIdCounter);

                // At this point, the token has reached its threshold and is ready to be issued.
                // This sets the token's `isIssued` flag to true and emits an event.
                issueAidToken(tokenIdCounter);

                // Move on to creating a new token by incrementing the token ID counter.
                tokenIdCounter++;

                // Reset the balance tracker for the new token.
                currentTokenBalance = 0;
            } else {
                // Case 2: The remaining donation is NOT enough to complete the current token.
                // Add the donor to the list of contributors for the current token.
                aidTokens[tokenIdCounter].donors.push(msg.sender);

                // Add the full remaining amount to this token's current balance.
                aidTokens[tokenIdCounter].donationAmount += remaining;

                // Update the token's balance with what remains.
                currentTokenBalance += remaining;

                // Added: Emit donation event for partial token funding
                emit Donation(msg.sender, remaining, tokenIdCounter);

                // Since all donated funds have been assigned to tokens, end the loop.
                remaining = 0;
            }
        }

        // Added: If we still have remaining funds to process but hit the token limit,
        // the funds are still stored in donorBalances for future donations
    }

    //This is the internal function to issue the aidtoken when the threshold has been met
    //only the ReliefAgency can call this function
    function issueAidToken(uint256 tokenId) internal {
        //TheaidToken donation amount must be equal to or greater than the threshold to pass
        require(
            aidTokens[tokenId].donationAmount >= donationThreshold,
            "Donation threshold not met"
        );

        //Goes back to the struct and sets it as true instead of false, so the token has been offically issued
        aidTokens[tokenId].isIssued = true;

        //Calls the event out to the blockchain so donors can view it
        emit AidTokenIssued(tokenId, aidTokens[tokenId].donors);
    }

    //Assigns transporter, ground relief, and recipient roles to an issued aid token.
    //This function ensures roles are valid, only assigned once, and verified via DIDRegistry.
    function assignAidRecipients(
        uint256 tokenId,
        address transferAddress,
        address groundAddress,
        address recipientAddress,
        string memory location
    ) external onlyReliefAgency {
        //Ensure the token ID exists (i.e., has been created previously).
        require(tokenId < tokenIdCounter, "Token ID does not exist");

        //Check that the token has already been issued via the donation mechanism
        require(aidTokens[tokenId].isIssued, "Token not yet issued");

        //Prevent re-assigning stakeholders to a token that already has assignments
        require(
            !aidTokens[tokenId].isAssigned,
            "This token already has assigned recipients"
        );

        //----------Role checks from DIDRegistry------------//
        //Confirm that the transfer address is registered as a Transporter.
        require(
            didRegistry.getRole(transferAddress) ==
                DIDRegistry.Role.Transporter,
            "Invalid transporter"
        );

        //Confirm that the ground address is registered as a Ground Relief team
        require(
            didRegistry.getRole(groundAddress) == DIDRegistry.Role.GroundRelief,
            "Invalid ground relief"
        );

        //Confirm that the recipient address is registered as a Recipient.
        require(
            didRegistry.getRole(recipientAddress) == DIDRegistry.Role.Recipient,
            "Invalid recipient"
        );

        //-----------DID prefix validation for role consistency-----------//
        //These checks ensure that the DID string registered for the address starts with the correct prefix.
        //Such as "transporter-", "groundrelief-", or "recipient-".
        //This is a safe guard to prevent role spoofing or tampering with DID labels.
        require(
            didRegistry.validateDIDPrefix(transferAddress, "transporter-"),
            "Transfer address DID prefix mismatch"
        );
        require(
            didRegistry.validateDIDPrefix(groundAddress, "groundrelief-"),
            "Ground relief DID prefix mismatch"
        );
        require(
            didRegistry.validateDIDPrefix(recipientAddress, "recipient-"),
            "Recipient DID prefix mismatch"
        );

        //This line ensures that the location provided when assigning the transfer team matches the location
        //that was originally registered for the transferAddress in the DIDRegistry contract.

        //Explanation step-by-step:
        //1. 'didRegistry.getLocation(transferAddress)' fetches the location string registered for the transfer team.
        //2. 'bytes(...)' converts both strings into byte arrays, since strings in Solidity can't be directly compared.
        //3. 'keccak256(...)' hashes both byte arrays into 32-byte values.
        // This hashing allows us to do a reliable equality check, even if the strings are of different lengths.
        //4. The comparison (==) checks if the hashed values of the two strings are equal.
        //5. If they are not equal, the transaction is reverted with the error message:
        //        "Transfer team location mismatch"
        require(
            keccak256(bytes(didRegistry.getLocation(transferAddress))) ==
                keccak256(bytes(location)),
            "Transfer team location mismatch"
        );
        require(
            keccak256(bytes(didRegistry.getLocation(groundAddress))) ==
                keccak256(bytes(location)),
            "Ground Relief location mismatch"
        );
        require(
            keccak256(bytes(didRegistry.getLocation(recipientAddress))) ==
                keccak256(bytes(location)),
            "Recipient location mismatch"
        );
        //Assign verified addresses to the aid token's metadata
        aidTokens[tokenId].transferTeam = transferAddress;
        aidTokens[tokenId].groundRelief = groundAddress;
        aidTokens[tokenId].recipient = recipientAddress;

        //Flag the token as having completed recipient assignment to prevent re-assignment
        aidTokens[tokenId].isAssigned = true;

        aidTokens[tokenId].location = location;

        // Added: Emit event when recipients are assigned to a token
        emit AidTokenAssigned(
            tokenId,
            transferAddress,
            groundAddress,
            recipientAddress
        );
    }

    //Getter function to retrieve the transfer team address for a specific token ID
    //This is necessary so external contracts (like AidTokenHandler) can access the
    //Transfer team address assigned to a particular aid token, as the 'aidTokens'
    //is internal to this contract
    function getTransferTeam(uint256 tokenId) public view returns (address) {
        return aidTokens[tokenId].transferTeam;
    }

    //Getter function to retrieve the ground relief team's address for a given token ID
    //This allows external verfication of who the correct ground relief party is for
    //that specific token, supproting authentication workflows in external contract interactions
    function getGroundRelief(uint256 tokenId) public view returns (address) {
        return aidTokens[tokenId].groundRelief;
    }

    //Getter function to return the recipient address assigned to a specific token ID
    //This supports validation that the correct recipient is claiming the aid,
    //especially important for functions that restrict access to only the intended beneficaries
    function getRecipient(uint256 tokenId) public view returns (address) {
        return aidTokens[tokenId].recipient;
    }

    //Similar Getter function the rest and returns if the bool indication if the token has been issued
    //or not. This is essential for authentication methods and assigning stakeholders as well as
    //we want the token to be actually issued.
    function isTokenIssued(uint256 tokenId) public view returns (bool) {
        return aidTokens[tokenId].isIssued;
    }
}

//Third Contract: AidTokenHandler
//This contract is responsible for handling the verification and status updates
//for AidTokens as they move through the aid delivery process
contract AidTokenHandler {
    //import "./AidToken.sol";

    //Reference to the deployed AidToken contract, used to access token data and verify roles
    //So basically we declare a public variable to store a
    //reference to the deployed AidToken contract
    //This allows the AidTokenHandler to call functions from the AidToken contract.
    AidToken public aidTokenContract;

    //Enum representing the different stages of aid delivery
    //Issued: Token has been created but nopt yet dispatched
    //InTransit: Aid is currently being transported to the location
    //Delivered: Aid has reached the ground relief team
    //Claimed: Final recipient has claimed the aid
    //Although its not stored in the AidToken struct directly, we use a seperate mapping (below)
    //to track each token's status independently. This keeps seperation of concerns clean.
    //Each tokenId will map to one of these enum values through the 'aidStatus' mapping
    enum AidStatus {
        Issued,
        InTransit,
        Delivered,
        Claimed
    }

    //Public view function that returns a human-readable string representing the current status of a given AidToken
    function getAidStatusString(
        uint256 tokenId
    ) public view returns (string memory) {
        //Retrieve the enum value (AidStatus) for the specified token ID from the aidStatus mapping
        AidStatus status = aidStatus[tokenId];
        //Check if the status is "Issued" and return the corresponding string
        if (status == AidStatus.Issued) return "Issued";
        //Check if the status is "InTransit" and return the corresponding string
        if (status == AidStatus.InTransit) return "InTransit";
        //Check if the status is "Delivered" and return the corresponding string
        if (status == AidStatus.Delivered) return "Delivered";
        //Check if the status is "Claimed" and return the corresponding string
        if (status == AidStatus.Claimed) return "Claimed";
        //If none of the defined enum values match (e.g., corrupted or uninitialized), return "Unknown"
        return "Unknown";
    }

    //Mapping to store the current status of each AidToken based on its token ID
    //This keeps track of the delivery progress for each aid package
    mapping(uint256 => AidStatus) public aidStatus;

    //Event to log each status update, includes tokenID, who triggered the update
    //and the new status. Useful for auditing and tracking purposes on-chain.
    event AidTransferred(uint256 tokenId, address actor, AidStatus newStatus);

    //Added: Event for tracking token status initialization
    event TokenStatusInitialized(uint256 indexed tokenId);

    //Constructor that runs once when the AidTokenHandler contract is deployed
    //It takes the address of the existing AidToken contract and stores it
    //so that this contract can interact with it.
    //So basically the address is cast to the 'AidToken' contract type, allowing us to
    //call its functions
    constructor(address _aidTokenAddress) {
        //Casts the address to the AidToken contract interface for use
        //Casts the raw address into a contract interfence reference
        //This does NOT automatically fetch or detect the contract -
        //the address must be provided manually during deployment
        //Once assigned, 'aidTokenContract' behaves like an object we can call methods on.
        aidTokenContract = AidToken(_aidTokenAddress);
        //^ So AidToken(_aidTokenAddress); is considered the actual contract address for
        //AidToken and then its stored as a variable using aidTokenContract
        //So from now on whenever we use AidTokenContract, we are directly talking to the
        //AidToken contract as the specificed address of that contract
    }

    // Added: Function to explicitly initialize a token's status to Issued
    // This adds clarity and ensures proper state initialization rather than relying on default values
    // Can be called by anyone, but only works for tokens that have been issued and not yet initialized
    function initializeTokenStatus(uint256 tokenId) public {
        // Verify the token has been issued through the AidToken contract
        require(
            aidTokenContract.isTokenIssued(tokenId),
            "Token has not been issued yet"
        );

        // Ensure the token status hasn't already been initialized (still at default value)
        require(
            aidStatus[tokenId] == AidStatus(0),
            "Token status already initialized"
        );

        // Explicitly set the token's status to Issued
        aidStatus[tokenId] = AidStatus.Issued;

        // Emit events to log the initialization
        emit AidTransferred(tokenId, msg.sender, AidStatus.Issued);
        emit TokenStatusInitialized(tokenId);
    }

    // Added: Batch token status query function
    // This allows frontend applications to efficiently retrieve the status of multiple tokens
    // in a single call, reducing the number of RPC requests needed
    function getTokenStatusBatch(
        uint256[] calldata tokenIds
    ) external view returns (string[] memory) {
        // Create an array to store the status strings with the same length as the input array
        string[] memory statuses = new string[](tokenIds.length);

        // Iterate through each token ID and get its status string
        for (uint256 i = 0; i < tokenIds.length; i++) {
            statuses[i] = getAidStatusString(tokenIds[i]);
        }

        // Return the array of status strings
        return statuses;
    }

    // I do not believe in the AidTokenHandler contract that the user needs to authenticate
    // Its location again, they only need to rely on the token Id and have to be logged into
    // their address when inputting the token Id.

    //Function for the transfer team to authenticate and update the aid status to "InTransit"
    function authenticateTransferTeam(uint256 tokenId) public {
        //Calls the issued function in the other contract to check if the token has been issued for that specified id
        require(
            aidTokenContract.isTokenIssued(tokenId),
            "Token has not been issued yet"
        );

        //Fetch the assigned transfer team address for the given token ID from the AidToken contract
        address transferassigned = aidTokenContract.getTransferTeam(tokenId);

        //Ensure that the caller is the correct transfer team that has been assigned to that specific token id
        require(
            msg.sender == transferassigned,
            "Only transfer team can mark InTransit"
        );

        //Ensure that the AidStatus of the token is in logical order in terms of progression. Goes Transfer -> Ground -> Claimed
        require(
            aidStatus[tokenId] == AidStatus.Issued,
            "Aid must be in 'Issued' status, or you have already claimed"
        );

        //If verficiation is successful, update the aid status mapping for this token
        aidStatus[tokenId] = AidStatus.InTransit;

        //Emit an event to log the aid package's status, with the actor's address
        emit AidTransferred(tokenId, msg.sender, AidStatus.InTransit);
    }

    //Function for the ground relief team to authenticate and update the aid status to "Delivered"
    function authenticateGroundRelief(uint256 tokenId) public {
        //Calls the issued function in the other contract to check if the token has been issued for that specified id
        require(
            aidTokenContract.isTokenIssued(tokenId),
            "Token has not been issued yet"
        );

        //Fetch the assigned ground team address for the given token ID from the AidToken contract
        address groundassigned = aidTokenContract.getGroundRelief(tokenId);

        //Ensure that the caller is the correct ground team that has been assigned to that specific token id
        require(
            msg.sender == groundassigned,
            "Only ground relief team can mark Delivered"
        );

        //Ensure that the AidStatus of the token is in logical order in terms of progression. Goes Transfer -> Ground -> Claimed
        require(
            aidStatus[tokenId] == AidStatus.InTransit,
            "Aid must be in 'InTransit' status, or you have already claimed"
        );

        //If verficiation is successful, update the aid status mapping for this token
        aidStatus[tokenId] = AidStatus.Delivered;

        //Emit an event to log the aid package's status, with the actor's address
        emit AidTransferred(tokenId, msg.sender, AidStatus.Delivered);
    }

    //Function for the recipient to authenticate and mark the aid as "Claimed"
    function claimAid(uint256 tokenId) public {
        //Calls the issued function in the other contract to check if the token has been issued for that specified id
        require(
            aidTokenContract.isTokenIssued(tokenId),
            "Token has not been issued yet"
        );

        //Special requirement so the Recipient can't fool the system and keep claiming
        require(aidStatus[tokenId] != AidStatus.Claimed, "Already claimed");

        //Fetch the assigned recipient address for the given token ID from the AidToken contract
        address repassigned = aidTokenContract.getRecipient(tokenId);

        //Ensure that the caller is the correct recipient that has been assigned to that specific token id
        require(msg.sender == repassigned, "Only recipient can claim aid");

        //Ensure that the AidStatus of the token is in logical order in terms of progression. Goes Transfer -> Ground -> Claimed
        require(
            aidStatus[tokenId] == AidStatus.Delivered,
            "Aid must be in 'Delivered' status"
        );

        //If verficiation is successful, update the aid status mapping for this token
        aidStatus[tokenId] = AidStatus.Claimed;

        //Emit an event to log the aid package's status, with the actor's address
        emit AidTransferred(tokenId, msg.sender, AidStatus.Claimed);
    }
}

//*************************************INSTRUCTIONS***************************************
//Instructions, so you have to go to a different address put at least 1 eth in the value endpoint
//and click to donate to add eth into the contract - adding 1 eth will turn it into 3 contracts
//as the threshold for a token is like 0.32 eth and so then we would be up to the fourth one but it can't
//be issued until its full
//Complicated shi so we have to get the contract address of the AidToken Contract and then use
//it when we are deploying for the second contract AidTokenHandler - that way AidTokenHandler
//we be able to properly call the functions in AidToken
//So if there tokenId is 1 and you want to authenticate yourself as the ground relief
//You have to go onto the Ground Relief address and then type in 1 in the authenticate system

//The stuff below just confused me so i need a reminder of the pain it caused:
//when you use "At Address" in Remix, you're only telling the IDE "here's the address
//of a deployed contract" — but if that contract wasn't deployed through your current
//project code (or you didn't import the correct interface), Remix can't interact
//with it properly. Deploying the second contract directly with the correct
//AidToken address as its constructor input ensures it's wired correctly from the start.

//**************************Explanation Stuff******************************
//There is probably a lot of stuff that should be explained better lol

// tokens 0, 1, and 2 are working for stakeholder authentication, but token 3 is not –
//and that's exactly what should happen based on the code. When a new token (e.g., token ID 3)
//is created during donation but hasn't yet met the donationThreshold (0.32 ETH),
//the issueAidToken() function is not called. That means: aidTokens[3].isIssued == false
//You can assign stakeholders to that token ID, but they cannot authenticate themselves
//until the token is officially issued. This prevents incomplete or underfunded tokens
//from moving through the aid process - which makes sense for auditability and security.

//Location Stuff Explained/Validation stuff
//When a user registers in the DIDRegistry, they assign a location (e.g., "PNG", "FIJI", etc.).
//In the AidToken contract's assignAidRecipients function, you already validate:
//  - That the address has the correct role (transporter, ground relief, or recipient)
//  - That the prefix of the DID matches (e.g., "transporter-").
//  - That the location of the address matches the location inputted when assigning (require(keccak256(...))).
// Only if all of these validations pass do you allow the AidToken to be assigned to the tokenId.
// Once the AidToken is assigned, you store the location into the AidTokenData struct for that tokenId.

//In the AidTokenHandler contract:
//When moving through the delivery stages (authenticateTransferTeam, authenticateGroundRelief, claimAid):
//  - You already confirm that the caller's address matches the assigned address from the AidToken struct.
//  - You enforce correct delivery order: Issued -> InTransit -> Delivered -> Claimed.

//Do you need to re-validate location again in AidTokenHandler?
//Answer: No, you don't need to validate location again.
//Why?
//  - The location check already happened when assigning recipients in the AidToken contract.
//  - The tokenId itself is already attached to the correct location.
//  - When verifying and updating delivery status (in the Handler contract), you are only checking that the right
//    address is acting at the right time.
//  - Adding another location check would just waste gas and unnecessarily complicate things.
