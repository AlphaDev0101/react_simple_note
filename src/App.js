import {
  Modal,
  Button,
  Form,
  FormControl,
  Dropdown,
  DropdownButton
} from 'react-bootstrap'
import React, { Component } from 'react'
import Navbar from './components/Navbar'
import Notes from './components/Notes'
import { Container, Row } from 'react-bootstrap'
import { v4 as uuidv4 } from 'uuid'
import './App.css'

class EditNoteModal extends Component {
  state = {
    title: this.props.note.title,
    body: this.props.note.body
  }

  handleChange = (event) => {
    this.setState({
      [event.target.name]: event.target.value
    })
  }

  render() {
    const { show, handleClose, handleSave } = this.props
    return (
      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Note</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="form-group">
            <label htmlFor="title">Title</label>
            <input
              type="text"
              name="title"
              id="title"
              className="form-control"
              onChange={this.handleChange}
              value={this.state.title}
            />
          </div>
          <div className="form-group">
            <label htmlFor="body">Body</label>
            <textarea
              name="body"
              id="body"
              rows="5"
              className="form-control"
              onChange={this.handleChange}
              value={this.state.body}
            ></textarea>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={() => handleSave(this.state)}>
            Save
          </Button>
        </Modal.Footer>
      </Modal>
    )
  }
}

class App extends Component {
  state = {
    notes: [],
    showEditModal: false,
    editedNote: null,
    searchQuery: '',
    sortOption: 'dateCreated'
  }

  handleInputChange = (event) => {
    this.setState({ searchQuery: event.target.value })
    this.handleSearch(event.target.value)
  }

  handleSortChange = (option) => {
    this.setState({ sortOption: option })
    this.handleSort(option)
  }

  componentDidMount() {
    if (localStorage.getItem('notes') !== null) {
      this.setState({
        notes: JSON.parse(localStorage.getItem('notes'))
      })
    }
  }

  addNote = (title, body) => {
    const notes = {
      id: uuidv4(),
      title: title,
      body: body,
      updatedAt: new Date()
    }
    const newNotes = [...this.state.notes, notes]
    localStorage.setItem('notes', JSON.stringify(newNotes))
    this.setState({ notes: newNotes })
  }

  deleteBtn = (id) => {
    const notes = this.state.notes.filter((note) => note.id !== id)
    localStorage.setItem('notes', JSON.stringify(notes))
    this.setState({ notes })
  }

  editBtn = (id) => {
    const note = this.state.notes.find((note) => note.id === id)
    this.setState({ showEditModal: true, editedNote: note })
  }

  handleEditClose = () => {
    this.setState({ showEditModal: false, editedNote: null })
  }

  handleEditSave = (newNote) => {
    const notes = [...this.state.notes]
    const noteIndex = notes.findIndex(
      (note) => note.id === this.state.editedNote.id
    )
    const editedNote = {
      ...this.state.editedNote,
      ...newNote,
      updatedAt: new Date()
    }
    notes[noteIndex] = editedNote
    localStorage.setItem('notes', JSON.stringify(notes))
    this.setState({ notes, showEditModal: false, editedNote: null })
  }

  handleSearch = (query) => {
    this.setState({ searchQuery: query })
  }

  getFilteredNotes = () => {
    const { notes, searchQuery } = this.state
    return notes.filter((note) => {
      return (
        note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.body.toLowerCase().includes(searchQuery.toLowerCase())
      )
    })
  }

  handleSort = (option) => {
    this.setState({ sortOption: option })
  }

  getSortedNotes = () => {
    const { searchQuery, sortOption } = this.state
    const filteredNotes = this.state.notes.filter((note) => {
      return (
        note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.body.toLowerCase().includes(searchQuery.toLowerCase())
      )
    })
    return filteredNotes.slice().sort((a, b) => {
      if (sortOption === 'title') {
        return a.title.localeCompare(b.title)
      } else if (sortOption === 'dateCreated') {
        return b.id.localeCompare(a.id)
      } else {
        return b.updatedAt.localeCompare(a.updatedAt)
      }
    })
  }

  render() {
    const filteredNotes = this.getFilteredNotes()
    const sortedNotes = this.getSortedNotes(filteredNotes)

    return (
      <div className="App">
        <Navbar
          addNote={this.addNote}
          onSearch={this.handleSearch}
          onSort={this.handleSort}
        />
        <Container style={{ marginTop: '100px' }}>
          <Form inline>
            <FormControl
              type="text"
              placeholder="Search"
              className="mr-sm-2"
              value={this.state.searchQuery}
              onChange={this.handleInputChange}
            />
          </Form>
          <DropdownButton
            id="sort-dropdown"
            title={`Sort by ${this.state.sortOption}`}
          >
            <Dropdown.Item onClick={() => this.handleSortChange('title')}>
              Title
            </Dropdown.Item>
            <Dropdown.Item onClick={() => this.handleSortChange('dateCreated')}>
              Date Created
            </Dropdown.Item>
            <Dropdown.Item onClick={() => this.handleSortChange('dateUpdated')}>
              Date Updated
            </Dropdown.Item>
          </DropdownButton>
          <Row>
            <Notes
              notes={sortedNotes}
              handleDelete={this.deleteBtn}
              handleEdit={this.editBtn}
            />
          </Row>
        </Container>
        {this.state.editedNote !== null && (
          <EditNoteModal
            note={this.state.editedNote}
            show={this.state.showEditModal}
            handleClose={this.handleEditClose}
            handleSave={this.handleEditSave}
          />
        )}
      </div>
    )
  }
}

export default App
