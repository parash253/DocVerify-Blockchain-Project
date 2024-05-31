import React, { useState } from 'react'
import { AppBar, Toolbar, Container, Box, Button, Typography, CircularProgress } from '@mui/material';
import Web3 from 'web3';
import SimpleStorage from '.././contracts/SimpleStorage.json';

const Issuer = () => {
  const [contract, setContract] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const[file,setFile] = useState("");
  const axios = require('axios');

  const loadBlockchainData = async (currentAccount) => {
    const web3 = new Web3(Web3.givenProvider || 'http://localhost:7545');
    const networkId = await web3.eth.net.getId();
    const networkData = SimpleStorage.networks[networkId];
    // For detecting network Data, truffle config must point to correct ganache networks. check truffle config file configuration.
    if (networkData) {
      const contractInstance = new web3.eth.Contract(SimpleStorage.abi, networkData.address);
      setContract(contractInstance);
    } else {
      window.alert('SimpleStorage contract not deployed to detected network.');
    }
  };

  React.useEffect(() => {
    loadBlockchainData();
    return () => {
      if (window.ethereum) {
        console.log("two is running");
        window.ethereum.removeListener('accountsChanged', () => {});
      }
    };
  }, []);

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
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
      const ipfsHash = responseData.data.IpfsHash;
      console.log("IPFS Hash:", ipfsHash);
      if (contract) {
        const hashExists = await contract.methods.fileExistsInBlockchain(ipfsHash).call();
        if (!hashExists) {
            window.alert('File is NOT Authentic and not in the blockchain.');
        } else {
            console.log("File Is Authentic and exists in the blockchain.");
            window.alert('File Is Authentic and exists in the blockchain.');
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
    <Container maxWidth="lg">
      <AppBar position="static" sx={{ backgroundColor: '#002e7b' }}>
        <Toolbar>
          <Typography variant="h6" component="div" style={{ fontSize: '2em'}}>
            Verifier Dashboard
          </Typography>
        </Toolbar>
      </AppBar>
      <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} py={4}>
        <Box flex={1} p={2} style={{ fontSize: '1.5em'}}>
          <h2>Lets Verify Authenticity.</h2>
          <p>For verifying any document's authenticity, Just upload the document and the system handles the rest.</p>
          <p>The System compares the Unique Hash of the file with the hashes of the file in blockchain. If the hash is already present in the BlockChain then it is authentic.</p>
        </Box>

        <Box flex={2} p={2}>
          <Box
            flex={1} p={2} textAlign="center"
            sx={{
              border: '2px dashed #ccc',
              borderRadius: '8px',
            }}>
            <img src="https://du11hjcvx0uqb.cloudfront.net/dist/webpack-production/6dfed94f78923783.svg" alt=""></img>
            <Typography variant="h5" gutterBottom>
              Upload Files to Verify
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
            <Typography variant='body1' sx={{ marginTop: 2 }}>
              {file.name}
            </Typography>
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
  );
};

export default Issuer;
