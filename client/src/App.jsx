import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HomePage from './components/HomePage';
import Issuer from './components/Issuer';
import Viewer from './components/Viewer';
import Verifier from './components/Verifier';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/issuer" element={<Issuer />} />
        <Route path="/viewer" element={<Viewer />} />
        <Route path="/verifier" element={<Verifier />} />
      </Routes>
    </Router>
  );
};

export default App;







































// import React, { useState } from 'react'
// import { Box, Button, Typography, CircularProgress } from '@mui/material';
// import CloudUploadIcon from '@mui/icons-material/CloudUpload';

// import { EthProvider } from "./contexts/EthContext";
// import Web3 from 'web3';
// import SimpleStorage from './contracts/SimpleStorage.json';

// function App() {

//   // Declare state variables
//   const [account, setAccount] = useState('');
//   const [contract, setContract] = useState(null);
//   const [storedHashes, setStoredHashes] = useState([]);
//   const [isUploading, setIsUploading] = useState(false);
//   const[file,setFile] = useState("");
//   const axios = require('axios');

//   const loadBlockchainData = async (currentAccount) => {
//     const web3 = new Web3(Web3.givenProvider || 'http://localhost:7545');
//     const accounts = await web3.eth.getAccounts();
//     const activeAccount = currentAccount || accounts[0];
//     console.log("Current user account is : ", activeAccount);
//     setAccount(activeAccount);

//     const networkId = await web3.eth.net.getId();
//     const networkData = SimpleStorage.networks[networkId];
//     // For detecting network Data, truffle config must point to correct ganache networks. check truffle config file configuration.
//     if (networkData) {
//       const contractInstance = new web3.eth.Contract(SimpleStorage.abi, networkData.address);
//       setContract(contractInstance);
//       console.log("network data detected");

//       const userFiles = await contractInstance.methods.getUserFiles(activeAccount).call();
//       const hashes = userFiles.map(file => file.ipfsHash);

//       setStoredHashes(hashes);
//       console.log("Stored IPFS hashes:", hashes);
//     } else {
//       window.alert('SimpleStorage contract not deployed to detected network.');
//     }
//   };

//   React.useEffect(() => {
//     loadBlockchainData();
//     if (window.ethereum) {
//       window.ethereum.on('accountsChanged', (accounts) => {
//         setAccount(accounts[0]);
//         console.log("accounts (one) changed to : ",accounts[0]);
//         loadBlockchainData(accounts[0]);
//       });
//     }

//     return () => {
//       if (window.ethereum) {
//         console.log("two is running");
//         window.ethereum.removeListener('accountsChanged', () => {});
//       }
//     };
//   }, []);

//   const handleFileChange = (event) => {
//     setFile(event.target.files[0]);
//   };

//   const handelSubmit = async(e) => {
//     setIsUploading(true);
//     e.preventDefault();
//     console.log(file);
//     try{
//       const fileData = new FormData();
//       fileData.append("file",file);

//       const responseData = await axios({
//         method: "post",
//         url: "https://api.pinata.cloud/pinning/pinFileToIPFS",
//         data:fileData,
//         headers:{
//           pinata_api_key:process.env.REACT_APP_API_KEY, 
//           pinata_secret_api_key:process.env.REACT_APP_SECRET_KEY, 
//           "Content-Type": "multipart/form-data",
//         },
//       });
//       // const fileUrl = "https://maroon-biological-ladybug-118.mypinata.cloud/ipfs/" + responseData.data.IpfsHash;
//       const ipfsHash = responseData.data.IpfsHash;
//       console.log("IPFS Hash:", ipfsHash);
//       if (contract) {
//         const hashExists = await contract.methods.fileExistsInBlockchain(ipfsHash).call();
//         if (!hashExists) {
//           await contract.methods.addFile(ipfsHash).send({ from: account });
//           const updatedHashes = [...storedHashes, ipfsHash];
//           setStoredHashes(updatedHashes);
//           console.log("Updated stored IPFS hashes:", updatedHashes);
//         }
//         else{
//           console.log("File already exists in the blockchain.");
//           window.alert('File is LEGIT becauuse this File already exists in the blockchain.');
//         }
//       }
//       setIsUploading(false);
//     }
//     catch(err){
//       console.log("the error is : ", err);
//       setIsUploading(false);
//     }
//   }
//   return (
//     <EthProvider>
//       <Box
//         sx={{
//           display: 'flex',
//           flexDirection: 'column',
//           alignItems: 'center',
//           padding: 2,
//           border: '2px dashed #ccc',
//           borderRadius: '8px',
//           backgroundColor: '#f9f9f9',
//           width: '100%',
//           maxWidth: 400,
//           margin: 'auto',
//         }}
//       >
//         <CloudUploadIcon color="primary" sx={{ fontSize: 50, marginBottom: 2 }} />
//         <Typography variant="h6" gutterBottom>
//           Upload Your File
//         </Typography>
//         <input
//           type="file"
//           onChange={handleFileChange}
//           style={{ display: 'none' }}
//           id="file-input"
//         />
//         <label htmlFor="file-input">
//           <Button variant="contained" component="span">
//             Choose File
//           </Button>
//         </label>
//         {file && (
//           <Typography variant='body1' sx={{ marginTop: 2 }}>
//             {file.name}
//           </Typography>
//         )}
//         <Button
//           type = 'submit'
//           variant="contained"
//           color="primary"
//           onClick={handelSubmit}
//           disabled={!file || isUploading}
//           sx={{ marginTop: 2 }}
//         >
//           {isUploading ? <CircularProgress size={24} /> : 'Upload'}
//         </Button>
  
//         {storedHashes.length > 0 && (
//           <Box sx={{ marginTop: 2 }}>
//             <Typography variant="h6">Uploaded Files:</Typography>
//             {storedHashes.map((hash, index) => (
//               <img
//                 key={index}
//                 src={`https://maroon-biological-ladybug-118.mypinata.cloud/ipfs/${hash}`}
//                 alt={`Uploaded file ${index + 1}`}
//                 style={{ width: '100%', marginBottom: '10px' }}
//               />
//             ))}
//           </Box>
//         )}
//       </Box>
//     </EthProvider>
//     );


// }

// export default App;







// SPDX-License-Identifier: MIT
// pragma solidity >=0.4.22 <0.9.0;

// contract SimpleStorage {
//     struct File {
//         uint id;
//         string ipfsHash;
//     }

//     mapping(address => File[]) private userFiles;
//     mapping(string => bool) private fileExists;
//     mapping(address => mapping(string => bool)) private userFileExists;
//     mapping(address => uint) public userFileCount;

//     event FileAdded(address indexed user, uint fileId, string ipfsHash);

//     function addFile(string memory _ipfsHash) public {
//         require(!fileExists[_ipfsHash], "File already exists in the blockchain.");
//         require(!userFileExists[msg.sender][_ipfsHash], "User already added this file.");
//         userFileCount[msg.sender]++;
//         userFiles[msg.sender].push(File(userFileCount[msg.sender], _ipfsHash));
//         fileExists[_ipfsHash] = true;
//         userFileExists[msg.sender][_ipfsHash] = true;
//         emit FileAdded(msg.sender, userFileCount[msg.sender], _ipfsHash);
//     }

//     function getFile(address _user, uint _fileId) public view returns (string memory) {
//         require(_fileId > 0 && _fileId <= userFileCount[_user], "File ID out of range.");
//         return userFiles[_user][_fileId - 1].ipfsHash;
//     }

//     function getUserFiles(address _user) public view returns (File[] memory) {
//         return userFiles[_user];
//     }

//     function fileExistsInBlockchain(string memory _ipfsHash) public view returns (bool) {
//         return fileExists[_ipfsHash];
//     }
// }

