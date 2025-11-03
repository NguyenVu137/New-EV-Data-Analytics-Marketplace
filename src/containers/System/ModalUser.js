import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import { emitter } from '../../utils/emitter'

class ModalUser extends Component {
    constructor(props) {
        super(props);
        this.state = {
            email: '',
            password: '',
            firstName: '',
            lastName: '',
            address: '',
            phonenumber: '',
            gender: 'M', // default
            roleId: 'R3' // default User
        }

        this.listenToEmitter();
    }

    listenToEmitter() {
        emitter.on('EVENT_CLEAR_MODAL_DATA', () => {
            this.setState({
                email: '',
                password: '',
                firstName: '',
                lastName: '',
                address: '',
                phonenumber: '',
                gender: 'M',
                roleId: 'R3'
            });
        });
    }

    toggle = () => {
        this.props.toggleFromParent();
    }

    handleOnChangeInput = (event, id) => {
        let copyState = { ...this.state };
        copyState[id] = event.target.value;
        this.setState({ ...copyState });
    }

    checkValideInput = () => {
        let isValid = true;
        let arrInput = ['email', 'password', 'firstName', 'lastName', 'address', 'gender', 'roleId'];
        for (let i = 0; i < arrInput.length; i++) {
            if (!this.state[arrInput[i]]) {
                isValid = false;
                alert('Missing parameter: ' + arrInput[i]);
                break;
            }
        }
        return isValid;
    }

    handleAddNewUser = () => {
        let isValid = this.checkValideInput();
        if (isValid) {
            this.props.createNewUser(this.state);
        }
    }

    render() {
        return (
            <Modal
                isOpen={this.props.isOpen}
                toggle={this.toggle}
                className={'modal-user-container'}
                size="lg"
            >
                <ModalHeader toggle={this.toggle}>Create a new user</ModalHeader>
                <ModalBody>
                    <div className="modal-user-body">
                        <div className="input-container">
                            <label>Email</label>
                            <input
                                type="text"
                                onChange={(event) => this.handleOnChangeInput(event, 'email')}
                                value={this.state.email}
                            />
                        </div>
                        <div className="input-container">
                            <label>Password</label>
                            <input
                                type="password"
                                onChange={(event) => this.handleOnChangeInput(event, 'password')}
                                value={this.state.password} />
                        </div>
                        <div className="input-container">
                            <label>First name</label>
                            <input
                                type="text"
                                onChange={(event) => this.handleOnChangeInput(event, 'firstName')}
                                value={this.state.firstName} />
                        </div>
                        <div className="input-container">
                            <label>Last name</label>
                            <input
                                type="text"
                                onChange={(event) => this.handleOnChangeInput(event, 'lastName')}
                                value={this.state.lastName} />
                        </div>
                        <div className="input-container max-width-input">
                            <label>Address</label>
                            <input
                                type="text"
                                onChange={(event) => this.handleOnChangeInput(event, 'address')}
                                value={this.state.address} />
                        </div>
                        <div className="input-container">
                            <label>Gender</label>
                            <select
                                value={this.state.gender}
                                onChange={(event) => this.handleOnChangeInput(event, 'gender')}
                            >
                                <option value="M">Male</option>
                                <option value="F">Female</option>
                                <option value="O">Other</option>
                            </select>
                        </div>
                        <div className="input-container">
                            <label>Role</label>
                            <select
                                value={this.state.roleId}
                                onChange={(event) => this.handleOnChangeInput(event, 'roleId')}
                            >
                                <option value="R1">Admin</option>
                                <option value="R2">Manager</option>
                                <option value="R3">User</option>
                            </select>
                        </div>
                    </div>
                </ModalBody>
                <ModalFooter>
                    <Button color='primary' className='px-3' onClick={this.handleAddNewUser}>Add new</Button>{' '}
                    <Button color="secondary" onClick={this.toggle}>Close</Button>
                </ModalFooter>
            </Modal>
        )
    }
}

export default connect(null, null)(ModalUser);
