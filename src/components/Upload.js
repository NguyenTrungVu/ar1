import React, { useState, useEffect } from "react";
import axios from "axios";

import { Form, Button, Container } from "react-bootstrap";

// const cloudinary = cloudinaryCreate({
//   cloud_name: "dcrqeomcc",
// });
const url = 'https://api.cloudinary.com/v1_1/dcrqeomcc/raw/upload';
export default function FileUploadPage() {
  const [selectedFile, setSelectedFile] = useState();
  const [isFilePicked, setIsFilePicked] = useState(false);
  const [file, setFile] = useState();

  const changeHandler = (event) => {
    setSelectedFile(event.target.files[0]);
    setIsFilePicked(true);
  };

  const handleSubmission = async (event) => {
    event.preventDefault();

    
    if (selectedFile) {
      console.log(selectedFile);
      // const url = cld.upload(selectedFile).toURL();
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append('upload_preset', 'dtumufpy');
      formData.append('folder', '3dmodel');
      
      try{
        const response = await axios.post(
          url,
          formData,
          {
            headers: { 'Content-Type': 'multipart/form-data' },
          }
        );
        console.log(response.data);
        alert("File uploaded successfully");
      }catch(err){
        console.log(err);
        alert("Error uploading file");
      }
    }
  };

  return (
    <Container>
      <Form onSubmit={handleSubmission}>
        <Form.Group className="mb-3" controlId="formBasicPassword">
          <Form.Label>Select File:</Form.Label>
          <Form.Control type="file" onChange={changeHandler} />
        </Form.Group>
        <Button variant="primary" type="submit">
          Submit
        </Button>
      </Form>
    </Container>

  );
}
