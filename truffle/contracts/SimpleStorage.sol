// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

contract SimpleStorage {
    mapping(uint => string) public files;
    uint public fileCount = 0;

    event FileAdded(uint fileId, string ipfsHash);

    function addFile(string memory _ipfsHash) public {
        fileCount++;
        files[fileCount] = _ipfsHash;
        emit FileAdded(fileCount, _ipfsHash);
    }

    function getFile(uint _fileId) public view returns (string memory) {
        return files[_fileId];
    }
}
