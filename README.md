# AidChain

These instructions/comments were extracted from the main code, please refer to that main code comments for step by step analysis




//*************************************INSTRUCTIONS***************************************
//1. Deploy the DIDRegistry code first and extract that contract's address
//2. Add it in the AidToken deployment input along with the Relief agency address then deploy
//3. Then extract the AidToken contract address and use it for the AidTokenHandler


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
//when you use "At Address" in Remix, you're only telling the IDE "here’s the address 
//of a deployed contract" — but if that contract wasn’t deployed through your current 
//project code (or you didn’t import the correct interface), Remix can’t interact 
//with it properly. Deploying the second contract directly with the correct 
//AidToken address as its constructor input ensures it’s wired correctly from the start.


//**************************Explanation Stuff******************************
//There is probably a lot of stuff that should be explained better lol

// tokens 0, 1, and 2 are working for stakeholder authentication, but token 3 is not – 
//and that’s exactly what should happen based on the code. When a new token (e.g., token ID 3)
//is created during donation but hasn't yet met the donationThreshold (0.32 ETH), 
//the issueAidToken() function is not called. That means: aidTokens[3].isIssued == false
//You can assign stakeholders to that token ID, but they cannot authenticate themselves 
//until the token is officially issued. This prevents incomplete or underfunded tokens 
//from moving through the aid process - which makes sense for auditability and security.
