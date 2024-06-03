// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

contract SimpleStorage {
    struct File {
        uint id;
        string ipfsHash;
        string studentName;
        string studentHobby;
        string recipientAddress;
    }

    mapping(address => File[]) private userFiles;
    mapping(string => bool) private fileExists;
    mapping(address => mapping(string => bool)) private userFileExists;
    mapping(address => uint) public userFileCount;
    mapping(address => string) private userCompanyNames;

    mapping(string => File[]) private recipientFiles;

    event FileAdded(address indexed user, uint fileId, string ipfsHash);
    event CompanyNameSet(address indexed user, string companyName);

    function addFile(string memory _recipientAddress, string memory _ipfsHash, string memory _studentName, string memory _studentHobby) public {
        require(!fileExists[_ipfsHash], "File already exists in the blockchain.");
        require(!userFileExists[msg.sender][_ipfsHash], "User already added this file.");
        userFileCount[msg.sender]++;
        File memory newFile = File(userFileCount[msg.sender], _ipfsHash, _studentName, _studentHobby, _recipientAddress);
        userFiles[msg.sender].push(newFile);
        recipientFiles[_recipientAddress].push(newFile); // Add file to recipientFiles mapping
        fileExists[_ipfsHash] = true;
        userFileExists[msg.sender][_ipfsHash] = true;
        emit FileAdded(msg.sender, userFileCount[msg.sender], _ipfsHash);
    }

    function getFile(address _user, uint _fileId) public view returns (string memory ipfsHash, string memory studentName, string memory studentHobby, string memory recipientAddress) {
        require(_fileId > 0 && _fileId <= userFileCount[_user], "File ID out of range.");
        File memory file = userFiles[_user][_fileId - 1];
        return (file.ipfsHash, file.studentName, file.studentHobby, file.recipientAddress);
    }

    function getUserFiles(address _user) public view returns (File[] memory) {
        return userFiles[_user];
    }

    function fileExistsInBlockchain(string memory _ipfsHash) public view returns (bool) {
        return fileExists[_ipfsHash];
    }

    function setCompanyName(string memory _companyName) public {
        userCompanyNames[msg.sender] = _companyName;
        emit CompanyNameSet(msg.sender, _companyName);
    }

    function getCompanyName(address _user) public view returns (string memory) {
        return userCompanyNames[_user];
    }
    function getFilesByRecipientAddress(string memory _recipientAddress) public view returns (File[] memory) {
        return recipientFiles[_recipientAddress];
    }
}























// pragma solidity >=0.4.22 <0.9.0;

// contract SimpleStorage {
//     mapping(uint => string) public files;
//     mapping(string => bool) private fileExists;
//     uint public fileCount = 0;

//     event FileAdded(uint fileId, string ipfsHash);

//     function addFile(string memory _ipfsHash) public {
//         require(!fileExists[_ipfsHash], "File already exists in the blockchain.");
//         fileCount++;
//         files[fileCount] = _ipfsHash;
//         fileExists[_ipfsHash] = true;
//         emit FileAdded(fileCount, _ipfsHash);
//     }

//     function getFile(uint _fileId) public view returns (string memory) {
//         return files[_fileId];
//     }

//     function fileExistsInBlockchain(string memory _ipfsHash) public view returns (bool) {
//         return fileExists[_ipfsHash];
//     }
// }










// pragma solidity >=0.4.22 <0.9.0;

// contract SimpleStorage {
//     mapping(uint => string) public files;
//     uint public fileCount = 0;

//     event FileAdded(uint fileId, string ipfsHash);

//     function addFile(string memory _ipfsHash) public {
//         fileCount++;
//         files[fileCount] = _ipfsHash;
//         emit FileAdded(fileCount, _ipfsHash);
//     }

//     function getFile(uint _fileId) public view returns (string memory) {
//         return files[_fileId];
//     }
// }
