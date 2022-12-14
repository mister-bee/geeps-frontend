import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Button, Container } from 'semantic-ui-react'
import axios from 'axios'
import './App.css';
import { ToastContainer, toast } from 'react-toastify';
import { v4 as uuidv4 } from 'uuid'
import moment from 'moment'
import Lottie from "lottie-react";
import 'react-toastify/dist/ReactToastify.css';
import downloadPdf from './images/download-pdf.svg';
import robot from './images/smile.svg';
import loadingAnimation from './images/loading-animation.json';
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
pdfMake.vfs = pdfFonts.pdfMake.vfs;

function App() {
  const [responseAI, setResponseAI] = useState(null)
  const [progressInput, setProgressInput] = useState(null)
  const [promptUsed, setPromptUsed] = useState(null)
  const [tempUsed, setTempUsed] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  const { register, handleSubmit, reset } = useForm({}); // errors
  const notify = (message) => toast(message);


  const onSubmit = formInput => {
    const baseUrl = process.env.REACT_APP_API_URL
    const { userRequest, temperature } = formInput


    const openAiRequest = { userRequest, temperature: parseFloat(temperature) };

    setPromptUsed(userRequest)
    setTempUsed(parseFloat(temperature))

    setIsLoading(true)

    axios.post(baseUrl + "openai", openAiRequest)
      .then(response => {
        setResponseAI(response.data)
        setIsLoading(false)

      })
      .catch(error => {
        setIsLoading(false)
        notify("🙄 " + error?.message)
      });
  };

  const keeper = () => {
    const newItem = {
      prompt: promptUsed,
      temperature: tempUsed,
      text: responseAI,
      meta: "",
      id: uuidv4()
    }

    const newProgressiveInput = progressInput ? [...progressInput] : []
    newProgressiveInput.push(newItem)
    setProgressInput(newProgressiveInput)
    setResponseAI(null)
  }



  const clearEntry = () => {
    setResponseAI(null)
    reset()
  }

  const deleteItem = (item) => {
    const newProgressiveInput = [...progressInput]
    const filteredInput = newProgressiveInput.filter(i => i.id !== item.id)
    setProgressInput(filteredInput)
  }

  const makePDF = () => {
    const printableInput = progressInput.map(item => "PROMPT: " + item.prompt + "\nTEMPERATURE: " + item.temperature + "\nRESPONSE:" + item.text + "\n\n")

    const docDefinition = {
      content: [
        { text: "The Geeps Super Knowledge Machine Results: ", bold: true },
        { text: moment().format('MMMM Do YYYY, h:mm:ss a') },
        { text: "\n", fontSize: 10 },
        { text: printableInput, fontSize: 10, bold: true },
        { text: "  ", fontSize: 10 }]
    }

    pdfMake.createPdf(docDefinition).download("Geeps_Keeper.pdf").open();

  }

  const progressInputDisplay = progressInput && progressInput.map(item => {
    return (
      <h3 style={{ margin: "5px", color: "grey", cursor: "pointer" }}>     {item.text}
        <span
          onClick={() => deleteItem(item)}
          style={{ cursor: "pointer" }}> ❌
        </span>
      </h3>)
  })

  const style = { height: 100 };

  return (
    <div className="App">
      <ToastContainer />
      <header className="App-header">
        <h1 style={{ margin: "2px" }}>The Super Knowledge Machine</h1>
      </header>
      <body>
        <br />
        <img src={robot} height="100" alt="robot" />
        <h2>Type your question below:</h2>
        <form onSubmit={e => e.preventDefault()}>
          <textarea
            type="text"
            placeholder="GPT-3 question..."
            rows="8" cols="80"
            {...register('userRequest', { required: true, maxLength: 1000 })} />

          <div>
            <br />
            <div>
              <label>Enter the 'temperature' between 0 and 1. The closer to 1 the more chances the AI will take.</label>
            </div>
            <input
              label="Temperature"
              type="number"
              step={.01}
              name="temperature"
              min="0" max="1"

              {...register('temperature', { required: true })} />
          </div>

          <div>
            <br />
            <div>
              <label>Enter max tokens. Default is 200.</label>
            </div>
            <input
              label="Max_tokens"
              type="number"
              step={10}
              name="max_tokens"
              min="100" max="500"

              {...register('max_tokens', { required: true })} />
          </div>

          <br />

          {isLoading ?
            <Lottie animationData={loadingAnimation} loop={true} style={style} />
            : <Button
              onClick={handleSubmit(onSubmit)}
              size="huge"
              type="submit"
              inverted color='blue'>Ask Geeps!
            </Button>
          }

          <br />
          {responseAI &&
            <>
              <Container text>
                <h2>{responseAI}</h2>
                <br />
              </Container>

              <Button onClick={keeper} color="green">Keeper</Button>
              <Button onClick={clearEntry} color="yellow">Clear Entry</Button>
              <br />
            </>
          }

          <br />
          <br />

          {progressInput?.length > 0 &&
            <>
              <div
                style={{
                  width: "60%",
                  height: "auto",
                  margin: "0 auto",
                  position: "relative"
                  // justifyContent: "center"
                  // alignItems: "center"
                }}>

                <div
                  style={{
                    textAlign: "left",
                    width: "100%",
                    borderStyle: "solid",
                    borderWidth: "1px",
                    borderColor: "black"
                  }}>

                  <h2 style={{ color: "grey", textAlign: "center" }}>All the Keepers:</h2>
                  {progressInputDisplay}

                </div>
                <br />
                <img src={downloadPdf} height="30" alt="React Logo" onClick={makePDF} />

              </div>
              <br />
            </>
          }

          <br />
          <br />
          <br />

        </form>
      </body>
    </div >
  );
}

export default App;