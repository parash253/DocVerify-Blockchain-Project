import React, { useState } from 'react'
import { AppBar, Toolbar, Container, Box, IconButton, Button, Typography, CircularProgress, TextField } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
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
      setCompanyName(nameofCompany);
      console.log("the name of company is : ", nameofCompany);

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
        console.log("accounts (one) changed to : ",accounts[0]);
        loadBlockchainData(accounts[0]);
      });
    }

    return () => {
      if (window.ethereum) {
        console.log("two is running");
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
      <Box sx={{ flexGrow: 1 }}>
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" sx={{ flexGrow: 1 }}>
              My DApp
            </Typography>
            <h3>Account: {account}</h3>
            {/* <Button color="inherit" onClick={loadBlockchainData}>Connect Wallet</Button> */}
          </Toolbar>
        </AppBar>
      </Box>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: 2,
          border: '2px dashed #ccc',
          borderRadius: '8px',
          backgroundColor: '#f9f9f9',
          width: '100%',
          maxWidth: 400,
          margin: '20px auto',
        }}
      >
      <Typography variant="h5" sx={{ marginBottom: 2 }}>
        {companyName}
        <IconButton onClick={handleEditClick}>
          <EditIcon />
        </IconButton>
      </Typography>
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
      

      </Box>
      <Container sx={{ marginTop: 4 }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: 2,
            border: '2px dashed #ccc',
            borderRadius: '8px',
            backgroundColor: '#f9f9f9',
            width: '100%',
            maxWidth: 400,
            margin: 'auto',
          }}>
          <CloudUploadIcon color="primary" sx={{ fontSize: 50, marginBottom: 2 }} />
          <Typography variant="h6" gutterBottom>
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
            label="Student Hobby"
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
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: 2,
            border: '2px dashed #ccc',
            borderRadius: '8px',
            backgroundColor: '#f9f9f9',
            width: '100%',
            maxWidth: 400,
            margin: 'auto',
            marginTop: 4
          }}>
          {storedHashes.length > 0 && (
            <Box sx={{ marginTop: 2 }}>
              <Typography variant="h6">Uploaded Files:</Typography>
              {storedHashes.map((file, index) => (
                <div key={index}>
                  <img
                    src={`https://maroon-biological-ladybug-118.mypinata.cloud/ipfs/${file.ipfsHash}`}
                    alt={`Uploaded file ${index + 1}`}
                    style={{ width: '100%', marginBottom: '10px' }}
                  />
                  <div>
                    <p>Student Name: {file.studentName}</p>
                    <p>Student Hobby: {file.studentHobby}</p>
                  </div>
                </div>
              ))}
            </Box>
          )}
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