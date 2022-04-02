import contract from "@truffle/contract"


async function loadcontract(name,provider){
    const res=await fetch(`/contracts/${name}.json`)
    const Artifact=await res.json()

    const _contract=contract(Artifact)
    let deployedcontract=null
    try{
        _contract.setProvider(provider)
        deployedcontract=await _contract.deployed()
    }catch(error){
        console.error("you are connected to the wrong network")
    }

    return deployedcontract
}


export default loadcontract