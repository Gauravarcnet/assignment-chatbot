import React from "react";
import io from "socket.io-client";

class Chat extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            userName: '',
            message: '',
            messages: [],
            onlineUser: [],
            userAdded: false,
            errorMessage: '',
            userJoin: false,
            displayData: []

        };

        //Socket listening at this server port
        // this.socket = io('localhost:8081')
        this.socket = io('https://sleepy-hollows-33642.herokuapp.com/')


        // new user land and request to join page
        this.addUser = ev => {
            ev.preventDefault();
            // console.log(this.state.useNname);
            this.socket.emit('ADD_USER', {
                userName: this.state.userName,
            })
        }

        // online user list Mehtod
        this.socket.on('ERROR', function (data) {
            console.log("data", data);
            error(data)
        })

        const error = (data) => {
            this.setState({ errorMessage: data })
        }
        this.refresh = () => {
            this.socket.emit('REFRESH')

        }

        this.socket.on('ONLINE_USER', function (data) {
            onlineUserList(data);
        })

        const onlineUserList = data => {
            this.setState({ userAdded: true, userJoin: true, errorMessage: null });
            this.setState({ onlineUser: data });
        }

        // Sending request to selected person 
        this.SendRequest = ev => {
            ev.preventDefault();
            let data = {
                "friendName": ev.target.friendName.value,
                "friendId": ev.target.friendId.value,
                "userName": this.state.userName
            }
            this.socket.emit('SEND_REQUEST', data)
        }

        this.socket.on('FRIEND_REQUEST', function (data) {
            appendData(data)
            acceptRequest(data)
        })

        this.socket.on('disconnect', function (data) {

        })

        const acceptRequest = (data) => {
            this.socket.emit('ACCEPT_REQUEST', {
                friendName: data.friendName,
                friendId: data.friendId,
                userName: this.state.userName
            })
        }

        this.socket.on('ACCEPTED_REQUEST', function (data) {
            appendData(data);
        });

        // creating dynamic chat pop window
        const appendData = (data) => {
            this.setState({ displayData: [...this.state.displayData, data] });
        }

        // Sending message 
        this.SendMessage = ev => {
            ev.preventDefault();
            let data = {
                "friendName": ev.target.friendName.value,
                "friendId": ev.target.friendId.value,
                "userName": this.state.userName,
                "message": ev.target.message.value
            }
            this.socket.emit('SEND_MESSAGE', data)

        }
        this.socket.on('MESSAGE', (data) => {
            // console.log("message",data);
            addMessage(data)
        })

        const addMessage = data => {
            this.setState({ messages: [...this.state.messages, data] });
        };

    }
    render() {
        return (
            <div className="container">
                <div className="row">
                    <div className="col-4">
                        <div className="card">
                            <div className="card-body">
                                <div className="card-title">Global Chat</div>
                                <hr />
                                <div className="messages">
                                    {this.state.messages.map(message => {
                                        return (
                                            <div>{message.userName}: {message.message}</div>
                                        )
                                    })}
                                </div>

                            </div>
                            {this.state.errorMessage &&
                                <p className="alert alert-danger"> {this.state.errorMessage}
                                </p>
                            }
                            {this.state.userJoin === false ? (<div className="card-footer">
                                <input type="text" placeholder="Username" value={this.state.userName} onChange={ev => this.setState({ userName: ev.target.value })} className="form-control" />
                                <br />
                                <button onClick={this.addUser} className="btn btn-primary form-control">Add</button>
                            </div>
                            ) : null}
                            <div>
                                {this.state.userAdded === true ? (
                                    <ol>
                                        <p>Online User</p>
                                        {
                                            Object.keys(this.state.onlineUser).map((keyName) => <li key={keyName}>
                                                {this.state.onlineUser[keyName]}
                                                <form onSubmit={this.SendRequest}>
                                                    <input type="hidden" name="friendId" value={this.state.onlineUser[keyName]} className="form-control" />
                                                    <br />
                                                    <input type="hidden" name="friendName" value={keyName} className="form-control" />
                                                    <br />
                                                    <input type="hidden" name="userName" value={this.username} className="form-control" />
                                                    <br />
                                                    <button type="submit" className="btn btn-primary form-control">SendRequest</button>
                                                </form>
                                            </li>)
                                        }
                                    </ol>
                                ) : (
                                        null
                                    )
                                }
                            </div>
                            <div>
                                {this.state.displayData.length >= 0 ? (<ol>
                                    {
                                        this.state.displayData.map((data) => <li key={data.friendName}>
                                            <form onSubmit={this.SendMessage}>
                                                <input type="hidden" name="friendId" value={data.friendId} className="form-control" />
                                                <br />
                                                <input type="hidden" name="friendName" value={data.friendName} className="form-control" />
                                                <br />
                                                <input type="hidden" name="userName" value={this.userName} className="form-control" />
                                                <br />
                                                <label>{data.friendName}</label>
                                                <input type="text" placeholder="Message" className="form-control" name="message" />
                                                <br />
                                                <button type="submit" className="btn btn-primary form-control">SendMessage</button>
                                            </form>
                                        </li>)
                                    }
                                </ol>) : null}

                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default Chat;