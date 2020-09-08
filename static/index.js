const store = localStorage;
const active_class = "text-success";
const passive_class = "text-danger";
document.addEventListener("DOMContentLoaded", () => {
  initial();

  var socket = io.connect(location.protocol + "//" + document.domain + ":" + location.port);
  socket.on("connect", () => {
    console.log("socket connected");
    document.querySelector("#msg_button").onclick = function () {
      document.querySelector("#msg_button").disabled = true;
      console.log("msg buttom clicked");
      const msg = document.querySelector("#msg").value;
      document.querySelector("#msg").value = "";
      if (store.getItem("channel_name")) {
        socket.emit("new message", {
          channel_name: store.getItem("channel_name"),
          message: msg,
          display_name: store.getItem("display_name"),
        });
      } else {
        alert("select a channel to send msg into : ");
      }
    };
    document.querySelector("#channel_button").onclick = () => {
      document.querySelector("#channel_button").disabled = true;
      console.log("channel button clicked");
      const channel_name = document.querySelector("#new_channel").value;
      document.querySelector("#new_channel").value = "";
      socket.emit("new channel", { channel_name: channel_name });
      console.log("channel emitted");
    };
  });
  socket.on("new message", (data) => {
    if (String(store.getItem("channel_name")) === String(data.channel_name)) {
      console.log("updating messages");
      const li = document.createElement("li");
      li.innerHTML = String(data.username) + "<br>" + "[" + String(data.time) + "]" + "<br>" + "===>" + String(data.message);
      document.querySelector("#message_window").appendChild(li);
    }
  });
  socket.on("new channel", (data) => {
    console.log(data);
    if (data.success == true) {
      const li = document.createElement("li");
      const a = document.createElement("a");
      a.innerHTML = String(data.channel_name);
      a.title = String(data.channel_name);
      a.href = "#";
      a.id = String(data.channel_name);
      a.classList.add(passive_class);
      a.onclick = function () {
        set_active_class(this.innerHTML);
        console.log("channel " + this.innerHTML);
        store.setItem("channel_name", this.innerHTML);
        get_messages(store.getItem("channel_name"));
        document.querySelector("#current_channel").innerHTML = this.innerHTML;
      };
      li.appendChild(a);
      document.querySelector("#channel_window").appendChild(li);
      set_active_class(data.channel_name);
      store.setItem("channel_name", data.channel_name);
      get_messages(data.channel_name); //not necessary
    } else {
      alert("channel already exist");
    }
  });
});
function set_active_class(tag) {
  if (store.getItem("channel_name"))
    if (document.querySelector("#" + store.getItem("channel_name")).classList.contains(active_class)) {
      document.querySelector("#" + store.getItem("channel_name")).classList.remove(active_class);
      document.querySelector("#" + store.getItem("channel_name")).classList.add(passive_class);
    }
  document.querySelector("#" + tag).classList.remove(passive_class);
  document.querySelector("#" + tag).classList.add(active_class);
}
function channel_onclick(a) {
  if (store.getItem("channel_name"))
    if (document.querySelector("#" + store.getItem("channel_name")).classList.contains(active_class)) {
      document.querySelector("#" + store.getItem("channel_name")).classList.remove(active_class);
      document.querySelector("#" + store.getItem("channel_name")).classList.add(passive_class);
    }
  console.log("#" + a.innerHTML);
  document.querySelector("#" + a.innerHTML).classList.remove(passive_class);
  document.querySelector("#" + a.innerHTML).classList.add(active_class);
  console.log("channel " + a.innerHTML);
  store.setItem("channel_name", a.innerHTML);
  document.querySelector("#current_channel").innerHTML = a.innerHTML;
  get_messages(store.getItem("channel_name"));
}

function get_messages(channel_name) {
  const request = new XMLHttpRequest();
  request.open("POST", "/messages");
  request.onload = () => {
    document.querySelector("#message_window").innerHTML = "";
    const data = JSON.parse(request.responseText);
    console.log("messgae loading");
    console.log(data);
    if (data.success) {
      let messages = data.messages;
      for (i in messages) {
        msg = messages[i];
        let li = document.createElement("li");
        li.innerHTML = String(msg.username) + "<br>" + "[" + String(msg.time) + "]" + "<br>" + "===>" + String(msg.message);
        document.querySelector("#message_window").appendChild(li);
        document.querySelector("#message_window").appendChild(li);
        console.log(li.innerHTML + "loaded");
      }
    } else {
    }
  };
  const data = new FormData();
  data.append("channel_name", channel_name);
  request.send(data);
  return false;
}

function initial() {
  document.querySelector("#msg_button").disabled = true;
  document.querySelector("#channel_button").disabled = true;

  document.querySelector("#new_channel").onkeyup = () => {
    if (document.querySelector("#new_channel").value.length > 0) document.querySelector("#channel_button").disabled = false;
    else document.querySelector("#channel_button").disabled = true;
  };
  document.querySelector("#msg").onkeyup = () => {
    if (document.querySelector("#msg").value.length > 0) document.querySelector("#msg_button").disabled = false;
    else document.querySelector("#msg_button").disabled = true;
  };

  if (store.getItem("display_name")) {
    console.log("test");
    document.querySelector("#display_name").innerHTML = store.getItem("display_name");
    if (store.getItem("channel_name")) {
      console.log("setting active claas initial");
      document.querySelector("#current_channel").innerHTML = store.getItem("channel_name");
      set_active_class(store.getItem("channel_name"));
      get_messages(store.getItem("channel_name"));
    }
  } else {
    let display_name = window.prompt("enter Display name");
    store.setItem("display_name", display_name);
    document.querySelector("#display_name").innerHTML = store.getItem("display_name");
  }
}
