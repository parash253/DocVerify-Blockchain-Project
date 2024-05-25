import React, { useState } from 'react'
import { Box, Button, Typography, CircularProgress } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

import { EthProvider } from "./contexts/EthContext";
import Web3 from 'web3';
import SimpleStorage from './contracts/SimpleStorage.json';

function App() {

  // Declare state variables
  const [account, setAccount] = useState('');
  const [contract, setContract] = useState(null);
  const [storedHashes, setStoredHashes] = useState([]);
  // const [file, setFile] = useState(null); 

  const [isUploading, setIsUploading] = useState(false);
  const[file,setFile] = useState("");
  const axios = require('axios');

  const loadBlockchainData = async () => {
    const web3 = new Web3(Web3.givenProvider || 'http://localhost:7545');
    const accounts = await web3.eth.getAccounts();
    console.log("Current user account is : ", accounts[0]);
    setAccount(accounts[0]);

    const networkId = await web3.eth.net.getId();
    const networkData = SimpleStorage.networks[networkId];
    console.log("networkID: ",networkId);
    console.log("networkData: ",networkData);
    // For detecting network Data, truffle config must point to correct ganache networks. check truffle config file configuration.
    if (networkData) {
      const contractInstance = new web3.eth.Contract(SimpleStorage.abi, networkData.address);
      setContract(contractInstance);
      console.log("network data detected");
      const fileCount = await contractInstance.methods.fileCount().call();
      let hashes = [];
      for (let i = 1; i <= fileCount; i++) {
        const fileHash = await contractInstance.methods.getFile(i).call();
        hashes.push(fileHash);
      }
      setStoredHashes(hashes);
      console.log("Stored IPFS hashes:", hashes);
    } else {
      window.alert('SimpleStorage contract not deployed to detected network.');
    }
    // Save IPFS hash to blockchain
    // await contract.methods.addFile(ipfsHash).send({ from: account });
  };

  React.useEffect(() => {
    loadBlockchainData();
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
      // const fileUrl = "https://maroon-biological-ladybug-118.mypinata.cloud/ipfs/" + responseData.data.IpfsHash;
      const ipfsHash = responseData.data.IpfsHash;
      console.log("IPFS Hash:", ipfsHash);
      if (contract) {
        await contract.methods.addFile(responseData.data.IpfsHash).send({ from: account });
        // await contract.methods.setIpfsHash(ipfsHash).send({ from: account });
        // console.log("IPFS hash stored in blockchain:", responseData.data.IpfsHash);
        const updatedHashes = [...storedHashes, ipfsHash];
        setStoredHashes(updatedHashes);
        console.log("Updated stored IPFS hashes:", updatedHashes);
      }
      // console.log("the file url is : ", fileUrl);
      setIsUploading(false);
    }
    catch(err){
      console.log("the error is : ", err);
      setIsUploading(false);
    }
  }
  return (
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
      }}
    >
      <CloudUploadIcon color="primary" sx={{ fontSize: 50, marginBottom: 2 }} />
      <Typography variant="h6" gutterBottom>
        Upload Your File
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
      <Button
        type = 'submit'
        variant="contained"
        color="primary"
        onClick={handelSubmit}
        disabled={!file || isUploading}
        sx={{ marginTop: 2 }}
      >
        {isUploading ? <CircularProgress size={24} /> : 'Upload'}
      </Button>
      {/* const fileUrl = "https://maroon-biological-ladybug-118.mypinata.cloud/ipfs/" + responseData.data.IpfsHash; */}

      {storedHashes.length > 0 && (
        <Box sx={{ marginTop: 2 }}>
          <Typography variant="h6">Uploaded Files:</Typography>
          {storedHashes.map((hash, index) => (
            <img
              key={index}
              src={`https://maroon-biological-ladybug-118.mypinata.cloud/ipfs/${hash}`}
              alt={`Uploaded file ${index + 1}`}
              style={{ width: '100%', marginBottom: '10px' }}
            />
          ))}
        </Box>
      )}
    {/* </Box> */}
    </Box>
  );

}

export default App;








  // const [selectedFile, setSelectedFile] = useState();
  // const changeHandler = (event) => {
  //   setSelectedFile(event.target.files[0]);
  // };

  // const handleSubmission = async () => {
  //   try {
  //     const formData = new FormData();
  //     formData.append("file", selectedFile);
  //     console.log("check this one  : ",formData);
  //     const metadata = JSON.stringify({
  //       name: "File name",
  //     });
  //     formData.append("pinataMetadata", metadata);
  //     console.log("check this two  : ",formData);


  //     const options = JSON.stringify({
  //       cidVersion: 0,
  //     });
  //     formData.append("pinataOptions", options);
  //     // console.log("check this three  : ",formData);
  //     // console.log("check this three  : ",import.meta.env.REACT_APP_PINATA_JWT);
  //     console.log("check this three  : ", process.env.REACT_APP_PINATA_JWT);


  //     const res = await fetch(
  //       "https://api.pinata.cloud/pinning/pinFileToIPFS",
  //       {
  //         method: "POST",
  //         headers: {
  //           Authorization: `Bearer ${import.meta.env.REACT_APP_PINATA_JWT}`,
  //         },
  //         body: formData,
  //       }
  //     );
  //     const resData = await res.json();
  //     console.log(resData);
  //   } catch (error) {
  //     console.log(error);
  //   }
  // };

  // return(
  //   <div>
  //     <h1>IPFS Tutorial -Upload file</h1>
  //     <form>
  //       <input type="file" onChange={(e)=>setFile(e.target.files[0])}/>
  //       <button type='submit' onClick={handelSubmit}>upload</button>
  //     </form>
  //   </div>
  // )

  // return (
  //   <>
  //     <label className="form-label"> Choose File</label>
  //     <input type="file" onChange={changeHandler} />
  //     <button onClick={handleSubmission}>Submit</button>
  //   </>
  // );
// }

// export default App;


/*


function App() {
  const [count,setCount] = useState(0);
  const[file,setFile] = useState("");
  const axios = require('axios');


  const handelSubmit = async(e) => {
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
          pinata_api_key:import.meta.env.REACT_APP_API_KEY, 
          pinata_secret_api_key:import.meta.env.REACT_APP_SECRET_KEY, 
          "Content-Type": "multipart/form-data",
        },
      });
      const fileUrl = "https://gateway.pinata.cloud/IPFS/" + responseData.data.IpfsHash;
      console.log("the file url is : ", fileUrl);
    }
    catch(err){
      console.log("the error is : ", err);
    }
  }
  return(
    <div>
      <h1>IPFS Tutorial -Upload file</h1>
      <form>
        <input type="file" onChange={(e)=>setFile(e.target.files[0])}/>
        <button type='submit' onClick={handelSubmit}>upload</button>
      </form>
    </div>
  )

}
export default App;

*/






















// class App extends Component {
//   constructor(props) {
//     super(props)

//     this.state = {
//       ipfsHash: '',
//       // web3: null,
//       buffer: 'null',
//       // account: null
//     }
//     this.captureFile = this.captureFile.bind(this);
//     this.onSubmit = this.onSubmit.bind(this);
//   }

//   // componentWillMount() {
//   //   // Get network provider and web3 instance.
//   //   // See utils/getWeb3 for more info.

//   //   getWeb3
//   //   .then(results => {
//   //     this.setState({
//   //       web3: results.web3
//   //     })

//   //     // Instantiate contract once web3 provided.
//   //     this.instantiateContract()
//   //   })
//   //   .catch(() => {
//   //     console.log('Error finding web3.')
//   //   })
//   // }

//   // instantiateContract() {
//   //   /*
//   //    * SMART CONTRACT EXAMPLE
//   //    *
//   //    * Normally these functions would be called in the context of a
//   //    * state management library, but for convenience I've placed them here.
//   //    */

//   //   const contract = require('truffle-contract')
//   //   const simpleStorage = contract(SimpleStorageContract)
//   //   simpleStorage.setProvider(this.state.web3.currentProvider)

//   //   // Get accounts.
//   //   this.state.web3.eth.getAccounts((error, accounts) => {
//   //     simpleStorage.deployed().then((instance) => {
//   //       this.simpleStorageInstance = instance
//   //       this.setState({ account: accounts[0] })
//   //       // Get the value from the contract to prove it worked.
//   //       return this.simpleStorageInstance.get.call(accounts[0])
//   //     }).then((ipfsHash) => {
//   //       // Update state with the result.
//   //       return this.setState({ ipfsHash })
//   //     })
//   //   })
//   // }

  

//   captureFile(event) {
//     console.log("captureFile running")

//     const axios = require('axios');

//     const ipfs = axios.create({
//       baseURL: 'http://127.0.0.1:5001',
//       timeout: 10000, // Timeout in milliseconds (10 seconds)
//       headers: {
//         'Content-Type': 'application/json',
//       },
//     });


//     const file = event.target.files[0]; // Get the selected file
//     const formData = new FormData();
//     formData.append('file', file);

//     // Make a POST request to add the file
//     ipfs.post('/add', formData).then(response => {
//       console.log('File added successfully:', response.data);
//     }).catch(error => {
//       console.error('Error adding file:', error);
//     });




//     // event.preventDefault()
//     // const file = event.target.files[0]
//     // const reader = new window.FileReader()
//     // reader.readAsArrayBuffer(file)
//     // reader.onloadend = () => {
//     //   console.log('running')
//     //   // console.log("check buffer : ",Buffer(reader.result))
//     //   this.setState({ buffer: reader.result }, () => {
//     //     console.log('buffer', this.state.buffer)
//     //   })
//     //   // this.setState({ buffer: Buffer(reader.result) })
//     //   // console.log('buffer', this.state.buffer)
//     // }
//   }

//   onSubmit(event) {

//     console.log("onSubmit running")




//     // const axios = require('axios');

//     // const ipfs = axios.create({
//     //   baseURL: 'http://127.0.0.1:5001/api/v0',
//     //   timeout: 10000, // Timeout in milliseconds (10 seconds)
//     //   headers: {
//     //     'Content-Type': 'application/json',
//     //   },
//     // });


//     // // Read the file to be added
//     // const fileContent = fs.readFileSync('3.jpg');

//     // // Create a FormData object
//     // const formData = new FormData();
//     // formData.append('file', fileContent);

//     // // Make a POST request to add the file
//     // ipfs.post('/add', formData).then(response => {
//     //   console.log('File added successfully:', response.data);
//     // }).catch(error => {
//     //   console.error('Error adding file:', error);
//     // });

//     // // Now you can use `ipfs` to make HTTP requests to your IPFS node
//     // ipfs.get('/version').then(response => {
//     //   console.log('IPFS Version:', response.data.Version);
//     // }).catch(error => {
//     //   console.error('Error getting IPFS version:', error);
//     // });

//     // console.log("submit running")
//     // event.preventDefault()


//     // const ipfs =  create();

//     // ipfs.add(this.state.buffer, (error, result) => {
//     //   console.log("success")
//     //   if(error) {
//     //     console.error(error)
//     //     return
//     //   }
//     //   // this.simpleStorageInstance.set(result[0].hash, { from: this.state.account }).then((r) => {
//     //   //   return this.setState({ ipfsHash: result[0].hash })
//     //   //   console.log('ifpsHash', this.state.ipfsHash)
//     //   // })
//     // })
//     // const uploadFiles = async () => {
//     //   try {
//     //     const result = await ipfs.add(file);
//     //     console.log('File added to IPFS:', result);
//     //     // for await (const file of ipfs.addAll(globSource('./docs', '**/*'))) {
//     //       // console.log('this is file: ', file);
//     //     // }
//     //   } catch (error) {
//     //     console.error('Error uploading files: ', error);
//     //   }
//     // }


//     // // const ipfs =  create();
//     // try {
//     //   const file = {
//     //     path: '3.jpg',
//     // // content: new TextEncoder().encode('Hello, IPFS!'),
//     //   };
//     //   const result = await ipfs.add(file);
//     //   console.log('File added to IPFS:', result);
//     // } catch (error) {
//     //   console.error('Error uploading files: ', error);
//     // }


//     // ipfs.files.add(this.state.buffer, (error, result) => {
//     //   if(error) {
//     //     console.error(error)
//     //     return
//     //   }
//     //   this.simpleStorageInstance.set(result[0].hash, { from: this.state.account }).then((r) => {
//     //     return this.setState({ ipfsHash: result[0].hash })
//     //     console.log('ifpsHash', this.state.ipfsHash)
//     //   })
//     // })
//   }

//   render() {
//     return (
//       <div className="App">
//         <nav className="navbar pure-menu pure-menu-horizontal">
//           <a href="#" className="pure-menu-heading pure-menu-link">IPFS File Upload DApp</a>
//         </nav>

//         <main className="container">
//           <div className="pure-g">
//             <div className="pure-u-1-1">
//               <h1>Your Image</h1>
//               <p>This image is stored on IPFS & The Ethereum Blockchain!</p>
//               {/* <img src={`https://ipfs.io/ipfs/${this.state.ipfsHash}`} alt=""/> */}
//               <h2>Upload Image</h2>
//               <form onSubmit={this.onSubmit} >
//                 <input type='file' onChange={this.captureFile} />
//                 <input type='submit' />
//               </form>
//             </div>
//           </div>
//         </main>
//       </div>
//     );
//   }
// }

// export default App



























// function App() {
//   // const projectId = '5c481e8a9f81403a8adb2811413439c0';
//   // const projectSecret = 'XfGbjIwKF7floMes8hux5Nn9cK18KnaI4mMNXTgenlug5Efc4XHNkQ';
//   // const ipfs = create({ url: 'http://127.0.0.1:5001' });
//   const ipfs =  create();
//   const uploadFiles = async () => {
//     try {
//       const file = {
//         path: '3.jpg',
//     // content: new TextEncoder().encode('Hello, IPFS!'),
//       };
//       const result = await ipfs.add(file);
//       console.log('File added to IPFS:', result);
//       // for await (const file of ipfs.addAll(globSource('./docs', '**/*'))) {
//         // console.log('this is file: ', file);
//       // }
//     } catch (error) {
//       console.error('Error uploading files: ', error);
//     }
//   };

//   uploadFiles();

//   // async function addFileToIPFS() {
//   //   // 5c481e8a9f81403a8adb2811413439c0
//   //   // XfGbjIwKF7floMes8hux5Nn9cK18KnaI4mMNXTgenlug5Efc4XHNkQ
//   //   // const auth ='Basic ' + Buffer.from(projectId + ':' + projectSecret).toString('base64')
//   //   // const client = await create({
//   //   //   host: 'ipfs.infura.io',
//   //   //   port: 5001,
//   //   //   protocol: 'https',
//   //   //   headers: {
//   //   //     authorization: auth
//   //   //   }
//   //   // })
//   //   // for await (const file of client.addAll(globSource("./docs", "*/"))) {
//   //   //   console.log('this is file: ', file)
//   //   // }

//   //   const ipfs =  create();
//   //   for await (const file of ipfs.addAll(globSource('./docs', '**/*'))){
//   //     console.log('this is file: ', file);
//   //   }
//   // }

//   // // Call the async function to start the process
//   // addFileToIPFS();
  
//   //   const ipfs = create()
//   //   const file = {
//   //     path: '3.jpg',
//   // // content: new TextEncoder().encode('Hello, IPFS!'),
//   //   };
//   //   const result = ipfs.add(file);
//   //   console.log('File added to IPFS:', result);
//   return (
//     <div className="App">
//       <nav className="navbar pure-menu pure-menu-horizontal">
//         <a href="#" className="pure-menu-heading pure-menu-link">IPFS File Upload DApp</a>
//       </nav>

//       <main className="container">
//         <div className="pure-g">
//           <div className="pure-u-1-1">
//             <h1>Your Image</h1>
//             <p>This image is stored on IPFS & The Ethereum Blockchain!</p>
//             {/* <img src={`https://ipfs.io/ipfs/${this.state.ipfsHash}`} alt=""/> */}
//             <h2>Upload Image</h2>
//             <form onSubmit={this.onSubmit} >
//               <input type='file' onChange={this.captureFile} />
//               <input type='submit' />
//             </form>
//           </div>
//         </div>
//       </main>
//     </div>
//   );
// }

// export default App;
