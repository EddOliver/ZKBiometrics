// SPDX-License-Identifier: MIT
pragma solidity >=0.7.0 <0.9.0;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

library Pairing {
    struct G1Point {
        uint256 X;
        uint256 Y;
    }
    struct G2Point {
        uint256[2] X;
        uint256[2] Y;
    }
}

struct Proof {
    Pairing.G1Point a;
    Pairing.G2Point b;
    Pairing.G1Point c;
}

interface IZokratesVerifier {
    function verifyTx(Proof memory proof, uint256[1] memory input)
        external
        view
        returns (bool r);
}

contract ZKaccount is ReentrancyGuard {
    // Owner
    address owner;
    // ZK Settings
    IZokratesVerifier zokratesVerifier;

    modifier onlyOwner() {
        require(msg.sender == owner, "Not authorized");
        _;
    }

    constructor(address _zokratesVeriferAddress) {
        owner = msg.sender;
        zokratesVerifier = IZokratesVerifier(_zokratesVeriferAddress);
    }

    // Natives Abtraction

    function getBalance() public view returns (uint256) {
        return address(this).balance;
    }

    function getBalanceECR20(address s_contract) public view returns (uint256) {
        IERC20 ERC20Contract = IERC20(s_contract);
        return ERC20Contract.balanceOf(address(this));
    }

    function transferNative(
        uint256 value,
        address payable to,
        Proof memory proof,
        uint256[1] memory input
    ) public {
        require(
            zokratesVerifier.verifyTx(proof, input) == true,
            "Incorrect Proof"
        );
        to.transfer(value);
    }

    function transferECR20(
        uint256 value,
        address _to,
        address _tokenContract,
        Proof memory proof,
        uint256[1] memory input
    ) public {
        IERC20 ERC20Contract = IERC20(_tokenContract);
        require(
            zokratesVerifier.verifyTx(proof, input) == true,
            "Incorrect Proof"
        );
        ERC20Contract.transfer(_to, value);
    }

    function transferECR721(
        address _to,
        address _tokenContract,
        Proof memory proof,
        uint256[1] memory input
    ) public {
        require(
            zokratesVerifier.verifyTx(proof, input) == true,
            "Incorrect Proof"
        );
        IERC721 ERC721Contract = IERC721(_tokenContract);
        ERC721Contract.transferFrom(address(this), _to, 0);
    }

    // Transfer Functions

    function newOwner(address _newOwner) public onlyOwner {
        owner = _newOwner;
    }

    function newVerifier(address _zokratesVeriferAddress) public onlyOwner {
        zokratesVerifier = IZokratesVerifier(_zokratesVeriferAddress);
    }

    // Receiver and Fallback Functions

    receive() external payable {} // Recieve Deposits

    fallback() external payable {} // Recieve Deposits if recieve doesn't work
}
