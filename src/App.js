
import './App.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import detectEthereumProvider from "@metamask/detect-provider"
import { useState } from "react"
import {useEffect} from "react"
import loadcontract from './utils/loaded-contract';
const web3=require('web3')

function App() {
    const [isConnecting,setIsConnecting]=useState(false)

    const [web3Api,setWeb3Api]=useState({
      provider:null,
      web3:null,
      contract:null
    })
     
    const [accounts,setaccounts]=useState(null)
    const [balances,setBalances]=useState(null)
    const [contributors,setContributors]=useState(null)
    const [tar,setTar]=useState(null)
    const [deadline,setDeadline]=useState(null)
    
    // console.log(window.ethereum)
    // console.log(window.web3)
  const detectProvider=async ()=>{
    let provider=await detectEthereumProvider();

    if(provider){
      provider=window.ethereum
    }
    else if(window.web3){
          provider=window.web3.currentProvider
    }
    else{
      alert("please install metamask")
    }
    const contract=await loadcontract("CrowdFunding",provider)
    setWeb3Api({
      provider,
      web3:new web3(provider),
      contract:contract
    })
    return provider,setWeb3Api
  }

  const  onSignInHandler=async ()=>{
        const provider=detectProvider()
        if(provider){
          if(provider!==window.ethereum){
            console.log("NOt window.ethereum provider")
          }
          setIsConnecting(true)
          await window.ethereum.request({
            method:'eth_requestAccounts'
          })
          setIsConnecting(false)
        }
       

  }
  console.log(web3Api.contract)
  useEffect(()=>{
    const getAcc=async ()=>{
         const accounts=await web3Api.web3.eth.getAccounts();
         setaccounts(accounts[0]) 
        }
        getAcc()
      },[web3Api.web3])
      useEffect(()=>{
        const loadBalance=async()=>{
          const {contract}=web3Api
          const balance=await web3Api.web3.eth.getBalance(contract.address);
          setBalances(balance)
        }
        web3Api.contract && loadBalance()
      },[onSignInHandler])
      
      const sendEth=()=>{
        const {contract}=web3Api
        contract.sendEth({
          from:accounts,
          value:100
        })
      }

      const refund=()=>{
        const {contract}=web3Api
        if(deadline=="0"){
          
          contract.refund()
        }else{
          toast.error('You cannot withdraw until deadline becomes Zero', {
            position: "top-center",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            });
        }
      }

      useEffect(()=>{
        const loadTarget=async ()=>{
            const {contract}=web3Api          
            let targ=await contract.target()
            setTar(targ.toString())
        }

        loadTarget()
      },[web3Api.contract])
     
      useEffect(()=>{
        const loadContributors=async()=>{
          const {contract}=web3Api
          let contri=await contract.noOfContributors()
          setContributors(contri.toString())
        }
        loadContributors()
      },[web3Api.contract])

      useEffect(()=>{
        const loadDeadline=async()=>{
          const {contract}=web3Api
          let deadl=await contract.deadline()
          setDeadline(Math.floor((deadl.toNumber()-(Math.floor(Date.now())/1000))))
        }
        loadDeadline()
      },[web3Api.contract])

  return (
    <div className="App">
       <div className="App">
          <h1>Welcome My Friend {accounts}</h1>
          <p>Raised Amount:&nbsp;<span style={{fontSize:"20px"}}>{balances}</span>&nbsp;Wei</p>
        <div className='is-flex m-5'>  
          <button className='button is-dark m-3' onClick={sendEth} >Donate Now</button>
          <button className='button is-dark m-3'
          onClick={refund}
          >Request to withdraw</button>
          </div> 
          <div className='is-flex'>
             <div className='flex-direction-column text-center  m-2 box '>
            <h2>Contributors</h2>
             <h1>{contributors}</h1>
             </div>
             <div className='flex-direction-column text-center m-2 box '>
            <h2>Target</h2>
             <h1>{tar}&nbsp;Wei</h1>
             </div>
             <div className='flex-direction-column text-center m-2 box '>
            <h2>Minimum Contribution</h2>
             <h1>100 Wei</h1>
             </div>
             <div className='flex-direction-column text-center m-2 box '>
            <h2>Deadline</h2>
             <h1>{deadline}</h1>
             </div>
          </div>
            { !accounts?
            <button className='button is-dark ' onClick={onSignInHandler} type='button'>
            {!isConnecting && "connect to metamask"}
            {isConnecting && "log in to metamask"}
            </button>:""}
            <ToastContainer />
       
    </div>
    </div>
  );
}

export default App;
