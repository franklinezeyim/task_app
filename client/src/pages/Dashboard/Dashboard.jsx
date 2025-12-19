import Form from "../../components/form/Form";
import SignUpForm from "../../components/form/SignUpForm";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import SwitchLeftIcon from '@mui/icons-material/SwitchLeft';
import SwitchRightIcon from '@mui/icons-material/SwitchRight';
import EditNoteIcon from '@mui/icons-material/EditNote';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import "./dashboard.css";
import EmojiPicker from 'emoji-picker-react';
import { useState, useRef } from "react";
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import ReadMoreText from "../../components/readMoreText/ReadMoreText";
import Footer from "../../components/footer/Footer";
import SideBar from "../../components/sideBar/sideBar";
import Header from "../../components/header/Header";
import ProgressiveBar from "../../components/progressiveBar/ProgressivBar";

const Dashboard = () => {
  // const details = [1,2,3,4,5];
  const headings = ["Task", "Status", "Deadline", "Action"];
  const details = [
    {
      id: 1,
      task: "lorem ipsum dolor sit amet consectetur adipisicing elit . Maiores, sed!",
      status: "pending",
      originalStatus: "pending",
      deadline: "12-12-2024",
      action: ["Edit", "Delete"],
    },
    {
      id: 2,
      task: "lorem ipsum dolor sit amet consectetur adipisicing elit . Maiores, sed!",
      status: "late",
      originalStatus: "late",
      deadline: "12-12-2024",
      action: ["Edit", "Delete"],
    },
    {
      id: 3,
      task: "lorem ipsum dolor sit amet consectetur adipisicing elit . Maiores, sed!",
      img: "https://picsum.photos/300/300?grayscale",
      status: "pending",
      originalStatus: "pending",
      deadline: "12-12-2024",
      action: ["Edit", "Delete"],

    },
    {
      id: 4,
      task: "lorem ipsum dolor sit amet consectetur adipisicing elit . Maiores, sed!",
      status: "pending",
      originalStatus: "pending",
      deadline: "12-12-2024",
      action: ["Edit", "Delete"],
    },
    {
      id: 5,
      task: "lorem ipsum dolor sit amet consectetur adipisicing elit . Maiores, sed!",
      status: "completed",
      img: "https://picsum.photos/id/237/200/300",
      originalStatus: "completed",
      deadline: "12-12-2024",
      action: ["Edit", "Delete"],
    },
  ];

  const [tasks, setTasks] = useState(details);
  const [checkedTasks, setCheckedTasks] = useState({});
  const [value, setValue] = useState('');
  const [toggleQuill, setToggleQuill] = useState(false);
  const [newTaskText, setNewTaskText] = useState("");

  // emoji
  const [text, setText] = useState('');
  const [showPicker, setShowPicker] = useState(false);
  const textareaRef = useRef(null);

  const onEmojiClick = (emojiObject) => {
    const { emoji } = emojiObject;
    const textarea = textareaRef.current;

    // Insert emoji at the current cursor position
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newText = text.substring(0, start) + emoji + text.substring(end);

    setText(newText);
    setShowPicker(false); // Close the picker after selection

    // Focus the textarea and set the cursor position after the emoji
    textarea.focus();
    textarea.setSelectionRange(start + emoji.length, start + emoji.length);
  };

  const isQuillEmpty = (html) => {
    if (!html) return true;
    const text = html.replace(/<[^>]*>/g, "").replace(/\u00A0/g, "").trim();
    return text === "";
  };


  return (
    <>
    <div className="dashboard">
      <SideBar/>
      <div className="container">
        <Header/>
        {/* <h2 className="welcomeMessage">Welcome user</h2> */}
        <div className="contentBox">
              <div id="contentBoxHeader">
                {headings.map((head) => (
                  <h3 key={head}>{head}</h3>
                ))}
              </div>
              <div>
                {tasks.map((task) => (
                    <div key={task.id} className="containerTaskRow">
                    <label className="containerTaskItems">
                      <input
                        type="checkbox"
                        className="customCheckbox"
                        checked={checkedTasks[task.id] || false}
                        onChange={() => {
                          const newChecked = !checkedTasks[task.id];

                          // toggle checkbox state
                          setCheckedTasks({
                            ...checkedTasks,
                            [task.id]: newChecked,
                          });

                          // update task status
                          setTasks((prev) =>
                            prev.map((item) =>
                              item.id === task.id
                                ? {
                                    ...item,
                                    status: newChecked
                                      ? "completed"
                                      : item.originalStatus, // restore original when unchecked
                                  }
                                : item
                            )
                          );
                        }}
                      />
                      <span className="checkmark"></span>
                      <div className="taskContent">
                        {task.img && (
                          <img
                            src={task.img}
                            alt={task.task ? task.task.substring(0, 50) : 'task image'}
                            className={task.status === "completed" ? "blurImg" : "taskImg"}
                            loading="lazy"
                          />
                        )}
                        <ReadMoreText limit={2} className={task.status === "completed" ? "completed" : ""}>{task.task}</ReadMoreText>
                      </div>
                      {/* <p   className={task.status === "completed" ? "completed" : ""}>{task.task}</p> */}
                    </label>
                    <div className="containerStatusItem">
                      <p
                        className={
                          task.status === "completed"
                            ? "statusCompleted"
                            : task.status === "late"
                            ? "statusOverdue"
                            : "statusPending" 
                        }
                      >
                        {task.status}
                      </p>
                    </div>
                    <div className="containerDeadlineItem">
                      <p>{task.deadline}</p>
                    </div>
                    <div className="containerActionItem">
                      {/* {task.status !== "completed" && ( */}
                        <button className={task.status !== "completed" ? "editButton" : "editButtonHidden"} disabled={task.status === "completed"}>
                          {task.action[0]}
                          <EditNoteIcon style={{ marginLeft: "5px" }} />
                        </button>
                      {/* )} */}

                      <button className="deleteButton">
                        {task.action[1]}
                        <DeleteOutlineIcon style={{ marginLeft: "5px" }} />
                      </button>
                    </div>
                  </div>
                ))}
          </div>
          <div className="addNewTask">
            <div className="addNewTaskIcons">
              <div onClick = {()=> setToggleQuill(!toggleQuill)}>
                {toggleQuill ? <SwitchRightIcon style={{cursor: "pointer"}} /> :  
                <SwitchLeftIcon style={{cursor: "pointer"}} />}
              </div>
            <div style={{ textAlign: "center", width: "50%" }}>
              <AddCircleIcon
                style={{
                  fontSize: "40px",
                  color: "#535bf2",
                  cursor: "pointer",
                }}
              />
            </div>
            </div>
            <div className="addNewTaskContent">
              <p>Add New Task</p>
              {/* Regular text area */}
              <div className="textArea">
                <div style={toggleQuill ? {width: "60%"} : {display: "none"}}>
                  <textarea
                    name="newTask"
                    id="newTask"
                    ref={textareaRef}
                    value={text}
                    // onChange={(e) => setNewTaskText(e.target.value)}
                    onChange={(e) => setText(e.target.value)}
                  />
                  <div style={{display: 'flex', justifyContent: 'space-between'}}>
                  <button className="emojiPickerButton" onClick={() => setShowPicker(!showPicker)}>
                      😊
                    </button>
                    {showPicker && (
                      <EmojiPicker onEmojiClick={onEmojiClick} />
                    )}
                  <div>
                    <button
                    className={showPicker ? "hideAddButton" : "addButton"}
                      type="button"
                      disabled={text.trim() === ""}
                      onClick={() => {
                        const trimmed = text.trim();
                        if (!trimmed) return;
                        const newItem = {
                          id: tasks.length ? Math.max(...tasks.map(t=>t.id))+1 : 1,
                          task: trimmed,
                          status: "pending",
                          originalStatus: "pending",
                          deadline: "",
                          action: ["Edit","Delete"],
                        };
                        setTasks(prev => [newItem, ...prev]);
                        setNewTaskText("");
                      }}
                    >
                      Add
                      <AddCircleOutlineIcon style={{ marginLeft: "5px" }} />
                    </button>
                  </div>
                  </div>
                </div>

                {/* React Qulll */}
                <div style={toggleQuill ? {display: "none"} : {width: "100%", display: "flex", justifyContent: "center", flexDirection: "column", height: "100%"}}>
                  <ReactQuill theme="snow" value={value} onChange={setValue} />
                  <div className="addQuill">
                    <button
                      className="addQuillButton"
                      type="button"
                      disabled={isQuillEmpty(value)}
                      onClick={() => {
                        const text = value.replace(/<[^>]*>/g, "").replace(/\u00A0/g, "").trim();
                        if (!text) return;
                        const newItem = {
                          id: tasks.length ? Math.max(...tasks.map(t=>t.id))+1 : 1,
                          task: text,
                          status: "pending",
                          originalStatus: "pending",
                          deadline: "",
                          action: ["Edit","Delete"],
                        };
                        setTasks(prev => [newItem, ...prev]);
                        setValue('');
                      }}
                    >
                      Add
                      <AddCircleOutlineIcon style={{ marginLeft: "5px" }} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
        <Footer/>
    </>
  );
};

export default Dashboard;
