import { useState } from "react";
import axios from "axios";
import "./Display.css";
const Display = ({ contract, account }) => {
  const [data, setData] = useState("");
  const [decodedDisplay, setDecodedDisplay] = useState(false);
  const [ipfsDisplay, setIpfsDisplay] = useState(false);

  const decode = async () => {
    axios.get('http://localhost:8008')
      .then(res => {
        if (res.data["status"] === "success") {
          console.log("From python server", res.data['url']);
          setDecodedDisplay(true)
        }
        else {
          console.log('Python server error');
        }
      })
  }

  const getdata = async () => {
    let dataArray;
    setIpfsDisplay(true)
    const Otheraddress = document.querySelector(".address").value;
    try {
      if (Otheraddress) {
        dataArray = await contract.display(Otheraddress);
        console.log(dataArray);
      } else {
        dataArray = await contract.display(account);
      }
    } catch (e) {
      alert("You don't have access");
    }
    const isEmpty = Object.keys(dataArray).length === 0;



    if (!isEmpty) {
      const str = dataArray.toString();
      const str_array = str.split(",");
      // console.log(str);
      // console.log(str_array);
      const images = str_array.map((item, i) => {
        return (
          <div>
            <img
              key={i}
              src={`https://gateway.pinata.cloud/ipfs/${item.substring(6)}`}
              alt="new"
              className="image-list"
            ></img>


          </div>
        );
      });
      setData(images);
    } else {
      setIpfsDisplay(false)
      alert("No image to display");
    }
  };
  return (
    <>

<input
        className="address"
        type="text"
        placeholder="Enter Address"
      ></input>
      <br></br>
      <button className="getData" onClick={getdata}>
        Get Data
      </button>
      <br></br>


      {ipfsDisplay && !decodedDisplay?<><div className="image-list">{data}</div><button className="decode" onClick={decode}>Decode</button></>:<></>}
      
      
      {decodedDisplay ? <><img src='https://be-project-2023.s3.ap-south-1.amazonaws.com/secret_image.jpg'></img></> : <div></div>}
      <br></br>
      
    </>
  );
};
export default Display;
