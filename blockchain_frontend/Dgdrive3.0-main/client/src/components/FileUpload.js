import { useState } from "react";
import axios from "axios";
import "./FileUpload.css";
import AWS from 'aws-sdk';

const FileUpload = ({ contract, account, provider }) => {
  
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState("No image selected");
  const [encodeDisplay, setEncodeDisplay] = useState(false);
  // const S3_BUCKET ='be-project-2023';
  // const REGION ='ap-south-1';
  // const accessKeyId = 'AKIAVQTYULZTFHK3F3PA';
  // const secretAccessKey = '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'
  const S3_BUCKET ='be-project-2023';
  const REGION ='ap-south-1';
  const accessKeyId = 'AKIAVQTYULZTFHK3F3PA';
  const secretAccessKey = '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'
  const myBucket = new AWS.S3({
    REGION,
    accessKeyId,
    secretAccessKey
  })
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (file) {
      try {
        const params = {
          Body: file,
          Bucket: S3_BUCKET,
          Key: "secret_image.jpg"
        };

        myBucket.putObject(params)
        .send((err) => {
          if (err) {
            console.log(err)
          }
          else
          {
            const imageUrl='https://be-project-2023.s3.ap-south-1.amazonaws.com/'+"secret_image.jpg"
            console.log('Upload Success!!',imageUrl)
            const headers = {
              'Content-Type': 'application/json',
              'Authorization': 'JWT fefege...',
              'Access-Control-Allow-Origin':'*',
              "Access-Control-Allow-Methods": "DELETE, POST, GET, OPTIONS",
              "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With"
            }
            axios.post('http://localhost:8008')
              .then(res => {
                if(res.data["status"]==="success") {
                  console.log("From python server",res.data['url']);
                  setEncodeDisplay(true)
                }
                else{
                  console.log('Python server error');
                }
              })
          }
        })

        
      } catch (e) {
        console.log('error',e);
      }
    }
    alert("Successfully Image Encoded");
    setFileName("No image selected");
    // setFile(null);
  };

  const upload=async()=>{
        
        const img = document.getElementById('encoded_display')

        await fetch(img.src)
        .then(res => {console.log(res);return res.blob()})
        .then(async (blob) => {
          const file1 = new File([blob], 'dot.png', {
            type: "image/jpeg",
          })
          console.log(file1)
          console.log(file)
          const formData = new FormData();
          formData.append("file", file1);

          const resFile = await axios({
            method: "post",
            url: "https://api.pinata.cloud/pinning/pinFileToIPFS",
            data: formData,
            headers: {
              // pinata_api_key: `c3799d7bae40c9b029f9`,
              pinata_api_key: `87a3fb156b9b6b67aedd`,
              // pinata_secret_api_key: `be6a2b6582c9b3fcc8da18cf6532299ccff568d511a2fa8fb9df66c74d689985`,
              pinata_secret_api_key: `54629ec08d5619261a1c75d9212977d5f4ee5cd45187301371f3b769f11c0851`,
              "Content-Type": "multipart/form-data",
            },
          });
          const ImgHash = `ipfs://${resFile.data.IpfsHash}`;
          const signer = contract.connect(provider.getSigner());
          await signer.add(account, ImgHash);
          window.alert('Encoded image uploaded successfully')
          setEncodeDisplay(false)
        })
        
  }
  const retrieveFile = (e) => {
    const data = e.target.files[0]; //files array of files object
    // console.log(data);
    const reader = new window.FileReader();
    reader.readAsArrayBuffer(data);
    reader.onloadend = () => {
      setFile(e.target.files[0]);
    };
    setFileName(e.target.files[0].name);
    e.preventDefault();
  };
  return (
    <div className="top">
      <form className="form" onSubmit={handleSubmit}>
        <label htmlFor="file-upload" className="choose">
          Choose Image
        </label>
        <input
          disabled={!account}
          type="file"
          id="file-upload"
          name="data"
          onChange={retrieveFile}
        />
        <span className="textArea">Image: {fileName}</span>
        <button type="submit"  className='encode_button'>
          Encode
        </button>
        
      </form>
      
      {encodeDisplay?<><img id='encoded_display' src='https://be-project-2023.s3.ap-south-1.amazonaws.com/hidden_image.jpg'/><br></br><button onClick={upload} className='upload_button' disabled={!file}>
          Upload File
        </button></>:<div></div>}
      
    </div>
  );
};
export default FileUpload;

// import { useState } from "react";
// import axios from "axios";
// import "./FileUpload.css";
// function FileUpload({ contract, provider, account }) {
//   // const [urlArr, setUrlArr] = useState([]);
//   const [file, setFile] = useState(null);
//   const [fileName, setFileName] = useState("No image selected");

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       if (file) {
//         try {
//           const formData = new FormData();
//           formData.append("file", file);

//           const resFile = await axios({
//             method: "post",
//             url: "https://api.pinata.cloud/pinning/pinFileToIPFS",
//             data: formData,
//             headers: {
//               pinata_api_key: `95f328a012f1634eab8b`,
//               pinata_secret_api_key: `8ea64e6b39c91631c66128a7c0e0dde35a6fbdf797a8393cc5ba8bf8d58e9b54`,
//               "Content-Type": "multipart/form-data",
//             },
//           });

//           const ImgHash = `ipfs://${resFile.data.IpfsHash}`;
//           const signer = contract.connect(provider.getSigner());
//           signer.add(account, ImgHash);

//           //setUrlArr((prev) => [...prev, ImgHash]);

//           //Take a look at your Pinata Pinned section, you will see a new file added to you list.
//         } catch (error) {
//           alert("Error sending File to IPFS");
//           console.log(error);
//         }
//       }

//       alert("Successfully Uploaded");
//       setFileName("No image selected");
//       setFile(null); //to again disable the upload button after upload
//     } catch (error) {
//       console.log(error.message); //this mostly occurse when net is not working
//     }
//   };
//   const retrieveFile = (e) => {
//     const data = e.target.files[0];
//     console.log(data);

//     const reader = new window.FileReader();

//     reader.readAsArrayBuffer(data);
//     reader.onloadend = () => {
//       setFile(e.target.files[0]);
//     };
//     setFileName(e.target.files[0].name);
//     e.preventDefault();
//   };
//   return (
//     <div className="top">
//       <form className="form" onSubmit={handleSubmit}>
//         <label htmlFor="file-upload" className="choose">
//           {/*turn around for avoding choose file */}
//           Choose Image
//         </label>
//         <input
//           disabled={!account} //disabling button when metamask account is not connected
//           type="file"
//           id="file-upload"
//           name="data"
//           onChange={retrieveFile}
//         />
//         <span className="textArea">Image: {fileName}</span>
//         {/* choose file */}
//         <button type="submit" disabled={!file} className="upload">
//           Upload file
//         </button>
//       </form>
//     </div>
//   );
// }

// export default FileUpload;
