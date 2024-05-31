import React, { useState } from 'react'
import { AppBar, Toolbar, Container, Box, IconButton, Button, Typography, CircularProgress, TextField } from '@mui/material';
import { EthProvider } from ".././contexts/EthContext";
import Web3 from 'web3';
import SimpleStorage from '.././contracts/SimpleStorage.json';
import EditIcon from '@mui/icons-material/Edit';

const Issuer = () => {
  const [account, setAccount] = useState('');
  const [contract, setContract] = useState(null);
  const [storedHashes, setStoredHashes] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const[file,setFile] = useState("");
  const [studentName, setStudentName] = useState("");
  const [studentHobby, setStudentHobby] = useState("");
  const axios = require('axios');

  const [companyName, setCompanyName] = useState('Your Company name appears here.');
  const [isEditing, setIsEditing] = useState(false);
  const loadBlockchainData = async (currentAccount) => {
    const web3 = new Web3(Web3.givenProvider || 'http://localhost:7545');
    const accounts = await web3.eth.getAccounts();
    const activeAccount = currentAccount || accounts[0];
    console.log("Current user account is : ", activeAccount);
    setAccount(activeAccount);
    const networkId = await web3.eth.net.getId();
    const networkData = SimpleStorage.networks[networkId];
    // For detecting network Data, truffle config must point to correct ganache networks. check truffle config file configuration.
    if (networkData) {
      const contractInstance = new web3.eth.Contract(SimpleStorage.abi, networkData.address);
      setContract(contractInstance);

      const nameofCompany = await contractInstance.methods.getCompanyName(activeAccount).call();
      const companyNameToSet = nameofCompany || "Fill Your Company Details";
      setCompanyName(companyNameToSet);

      const userFiles = await contractInstance.methods.getUserFiles(activeAccount).call();
      const hashes = userFiles.map(file => ({ ipfsHash: file.ipfsHash, studentName: file.studentName, studentHobby: file.studentHobby }));
      setStoredHashes(hashes);
    } else {
      window.alert('SimpleStorage contract not deployed to detected network.');
    }
  };

  React.useEffect(() => {
    loadBlockchainData();
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts) => {
        setAccount(accounts[0]);
        loadBlockchainData(accounts[0]);
      });
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', () => {});
      }
    };
  }, []);

  const handleCompanyNameChange = (e) => {
    setCompanyName(e.target.value);
  };

  const handleSetCompanyName = async () => {
    await contract.methods.setCompanyName(companyName).send({ from: account });
  };
  const handleEditClick = () => {
    setIsEditing(!isEditing);
  };

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };
  const handleStudentNameChange = (event) => {
    setStudentName(event.target.value);
  };
  
  const handleStudentHobbyChange = (event) => {
    setStudentHobby(event.target.value);
  };

  const handelSubmit = async(e) => {
    setIsUploading(true);
    e.preventDefault();
    console.log(file);
    try{
      const fileData = new FormData();
      fileData.append("file",file);
      const responseData = await axios({
        method: "post",
        url: "https://api.pinata.cloud/pinning/pinFileToIPFS",
        data:fileData,
        headers:{
          pinata_api_key:process.env.REACT_APP_API_KEY, 
          pinata_secret_api_key:process.env.REACT_APP_SECRET_KEY, 
          "Content-Type": "multipart/form-data",
        },
      });
      // const fileUrl = "https://maroon-biological-ladybug-118.mypinata.cloud/ipfs/" + responseData.data.IpfsHash;
      const ipfsHash = responseData.data.IpfsHash;
      console.log("IPFS Hash:", ipfsHash);
      if (contract) {
        const hashExists = await contract.methods.fileExistsInBlockchain(ipfsHash).call();
        if (!hashExists) {
            await contract.methods.addFile(ipfsHash, studentName, studentHobby).send({ from: account });
            const updatedHashes = [...storedHashes, { ipfsHash: ipfsHash, studentName: studentName, studentHobby: studentHobby }];
            setStoredHashes(updatedHashes);
        } else {
            console.log("File already exists in the blockchain.");
            window.alert('File already exists in the blockchain.');
        }
    }
    
      setIsUploading(false);
    }
    catch(err){
      console.log("the error is : ", err);
      setIsUploading(false);
    }
  }

  return (
    <EthProvider>
      <Container maxWidth="lg">
        <AppBar position="static" sx={{ backgroundColor: '#002e7b' }}>
          <Toolbar>
            <Typography variant="h6" component="div" style={{ fontSize: '2em', flexGrow: 1 }}>
              Issuer Dashboard
            </Typography>
            <Typography variant="h6" component="div" style={{ fontSize: '1.3em' }}>
              LogIn as: {account}
            </Typography>
          </Toolbar>
        </AppBar>
        
        <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} py={4}>
          <Box flex={1} p={2} style={{ fontSize: '1.5em', textAlign: 'justify'}}>
            <div style={{ display: 'flex', justifyContent: 'space-between',}}>
              <h2>{companyName}</h2>
              <IconButton onClick={handleEditClick}>
                <EditIcon />
              </IconButton>
            </div>
            {isEditing && (
              <>
                <TextField
                  label="Company Name"
                  variant="outlined"
                  fullWidth
                  value={companyName}
                  onChange={handleCompanyNameChange}
                  sx={{ marginBottom: 2 }}
                />
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleSetCompanyName}
                >
                  Set
                </Button>
              </>
            )}
            <p>This is an issuing organization Dashboard.</p>
            <p>When Organization issue certificate to individuals, large size files like image, pdf, etc are stored in IPFS data storage because storing such large file on the blockchain is costly. Only the hash of that file is stored in the blockchain along with individuals details.</p>
          </Box>
        {/* style={{ backgroundColor: 'red'}} */}
          {storedHashes.length > 0 && (
            <Box flex={2} p={2} style={{ fontSize: '1.5em', textAlign: 'justify'}}>
              {storedHashes.map((file, index) => (
                <div key={index}>
                  <img
                    src={`https://maroon-biological-ladybug-118.mypinata.cloud/ipfs/${file.ipfsHash}`}
                    alt={`Uploaded file ${index + 1}`}
                    style={{ width: '100%'}}
                  />
                  <div>
                    <p>Student Name: {file.studentName}</p>
                    <p>Certificate Name: {file.studentHobby}</p>
                  </div>
                </div>
              ))}
            </Box>
          )}

          <Box flex={2} p={2}>
            <Box
              flex={1} p={2} textAlign="center"
              sx={{
                border: '2px dashed #ccc',
                borderRadius: '8px',
              }}>
              <img src="https://du11hjcvx0uqb.cloudfront.net/dist/webpack-production/6dfed94f78923783.svg" alt=""></img>
              <Typography variant="h5" gutterBottom>
                Upload Credentials
              </Typography>
              <input
                type="file"
                onChange={handleFileChange}
                style={{ display: 'none' }}
                id="file-input"
              />
              <label htmlFor="file-input">
                <Button variant="contained" component="span">
                  Choose File
                </Button>
              </label>
              {file && (
                <Typography variant='body1' sx={{ marginTop: 2 }}>
                  {file.name}
                </Typography>
              )}
              <TextField
                label="Student Name"
                value={studentName}
                onChange={handleStudentNameChange}
                fullWidth
                variant="outlined"
                sx={{ marginTop: 2 }}
              />
              <TextField
                label="Certificate Name"
                value={studentHobby}
                onChange={handleStudentHobbyChange}
                fullWidth
                variant="outlined"
                sx={{ marginTop: 2 }}
              />
              <Button
                type='submit'
                variant="contained"
                color="primary"
                onClick={handelSubmit}
                disabled={!file || isUploading}
                sx={{ marginTop: 2 }}>
                {isUploading ? <CircularProgress size={24} /> : 'Upload'}
              </Button>
            </Box>
          </Box>
        </Box>
      </Container>
    </EthProvider>
  );
};

export default Issuer;










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