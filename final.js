let commentsDataStructure = JSON.parse(localStorage.getItem('_comments'))
  ? [JSON.parse(localStorage.getItem('_comments'))]
  : [{ data: 'global', children: [] }]

let formElement = document.getElementById('comments-form')
let authorNameInputElement = document.getElementById('author-name-input')
let commentInputElement = document.getElementById('comment-input')
let commentsSection = document.getElementById('comments-section')
let parentAuthorName = null
let replyFlag = false
let editFlag = false
let parentAuthorId = null

formElement.addEventListener('submit', (e) => {
  e.preventDefault()
  if (
    authorNameInputElement.value.trim().length &&
    commentInputElement.value.trim().length
  ) {
    // for saving entered comment
    addCommentToDataStructure()

    // for saving comments to Local Storage
    saveToLocalStorage()

    // for displaying comments on screen
    displayComments()
  } else {
    alert('Nice try!, but enter valid author name and comment')
  }
  authorNameInputElement.value = ''
  commentInputElement.value = ''
  document.getElementById('reply-here-text')?.remove()
  editFlag = false
  replyFlag = false
})

// for saving entered comment
function addCommentToDataStructure() {
  if (replyFlag) {
    addReply()
  }
  if (editFlag) {
    editComment(parentAuthorId)
  }
  if (!replyFlag && !editFlag) {
    addGlobalComment()
  }
  replyFlag = false
  editFlag = false
}

// first search for parent element and add children to it
function addReply() {
  commentsDataStructureTraversal((element) => {
    for (let i = 0; i < element.children.length; i++) {
      if (
        typeof element.children[i].data == 'object' &&
        element.children[i].data.author == parentAuthorName &&
        element.children[i].data.id == parentAuthorId
      ) {
        element.children[i].children.push({
          data: {
            author: authorNameInputElement.value,
            comment: commentInputElement.value,
            id: Math.floor(Math.random() * 1000 + 1),
            date: new Date().toLocaleString(),
            space: element.children[i].data.space + 3.2,
          },
          children: [],
        })
      }
    }
  }, commentsDataStructure[0])
}

// add comment to global element
function addGlobalComment() {
  commentsDataStructure[0].children = [
    ...commentsDataStructure[0].children,
    {
      data: {
        author: authorNameInputElement.value,
        comment: commentInputElement.value,
        id: Math.floor(Math.random() * 1000 + 1),
        date: new Date().toLocaleString(),
        space: 0,
      },
      children: [],
    },
  ]
  replyFlag = false
  editFlag = false
}

// for displaying comments on screen
function displayComments() {
  // for not adding comments again to existing comments
  while (commentsSection.firstChild) {
    commentsSection.firstChild.remove()
  }

  commentsDataStructureTraversal(createDisplayNodes, commentsDataStructure[0])
}

// create and append html element for every single comment
function createDisplayNodes(element) {
  if (typeof element.data == 'object') {
    let wholeDivContainer = document.createElement('div')
    wholeDivContainer.id = 'whole-comment-container'

    let divElement = document.createElement('div')
    divElement.id = `comment-container`
    divElement.className = ` ${element.data.id}`
    divElement.style.marginLeft = `${element.data.space}rem`

    let authorNameElement = document.createElement('p')
    authorNameElement.id = 'author-name'
    authorNameElement.innerText = element.data.author

    let dateAndTimeElement = document.createElement('span')
    dateAndTimeElement.id = 'date-time'
    dateAndTimeElement.innerText = element.data.date

    authorNameElement.appendChild(dateAndTimeElement)
    divElement.appendChild(authorNameElement)

    let commentElement = document.createElement('p')
    commentElement.id = 'comment'
    commentElement.innerText = element.data.comment

    let buttonsElement = document.createElement('div')
    buttonsElement.id = 'buttons'

    let replyButtonElement = document.createElement('button')
    replyButtonElement.id = 'reply-btn'
    replyButtonElement.innerText = 'Reply'
    replyButtonElement.addEventListener('click', setReplyFlagAndDisplayText)

    let editButtonElement = document.createElement('button')
    editButtonElement.id = 'edit-btn'
    editButtonElement.innerText = 'Edit'
    editButtonElement.addEventListener('click', setEditFlag)

    let deleteButtonElement = document.createElement('button')
    deleteButtonElement.id = 'delete-btn'
    deleteButtonElement.innerText = 'Delete'
    deleteButtonElement.addEventListener('click', deleteComment)

    buttonsElement.appendChild(replyButtonElement)
    buttonsElement.appendChild(editButtonElement)
    buttonsElement.appendChild(deleteButtonElement)

    wholeDivContainer.appendChild(divElement)
    divElement.appendChild(commentElement)
    divElement.appendChild(buttonsElement)
    commentsSection.appendChild(wholeDivContainer)
  }
}

// for saving comments to Local Storage
function saveToLocalStorage() {
  window.localStorage.setItem(
    '_comments',
    JSON.stringify(commentsDataStructure[0])
  )
}

// for traversing every comment and applying callback for every comment
function commentsDataStructureTraversal(callback, commentsArray) {
  ;(function recurse(currentElement) {
    callback(currentElement)
    for (let i = 0; i < currentElement.children.length; i++) {
      recurse(currentElement.children[i])
    }
  })(commentsArray)
}

// for making browser know that user is trying to reply
function setReplyFlagAndDisplayText(e) {
  replyFlag = true
  editFlag = false
  let { authorName, authorId } = findAuthorNameAndId(e)
  parentAuthorName = authorName
  parentAuthorId = authorId

  showSuggestion('you can enter your reply here')
  window.scrollTo({ top: 0, behavior: 'smooth' })
  authorNameInputElement.value = ''
  commentInputElement.value = ''
}

function deleteComment(e) {
  let { authorName, authorId } = findAuthorNameAndId(e)

  let callback = function (element) {
    for (let i = 0; i < element.children.length; i++) {
      if (
        element.children[i].data.author == authorName &&
        element.children[i].data.id == authorId
      ) {
        element.children.splice(i, 1)
      }
    }
  }

  commentsDataStructureTraversal(callback, commentsDataStructure[0])
  document.getElementById('reply-here-text')?.remove()
  authorNameInputElement.value = ''
  commentInputElement.value = ''
  saveToLocalStorage()
  window.scrollTo({ top: 0, behavior: 'smooth' })
  displayComments()
  replyFlag = false
  editFlag = false
}

function setEditFlag(e) {
  showSuggestion('you can edit your reply here')

  let { authorName, authorId } = findAuthorNameAndId(e)
  parentAuthorId = authorId

  let comment = e.target.parentElement.previousElementSibling.innerText

  editFlag = true
  replyFlag = false

  authorNameInputElement.value = authorName
  commentInputElement.value = comment
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function showSuggestion(text) {
  document.getElementById('reply-here-text')?.remove()
  let domInstance = document.getElementById('whole-wrapper')
  let replyHereTextElement = document.createElement('p')
  replyHereTextElement.id = 'reply-here-text'
  replyHereTextElement.innerText = text
  domInstance.insertBefore(replyHereTextElement, domInstance.firstChild)
}

function editComment(parentAuthorId) {
  let child = null,
    callback = function (element) {
      if (element.data.id == parentAuthorId) {
        child = element
      }
    }

  commentsDataStructureTraversal(callback, commentsDataStructure[0])
  if (child) {
    child.data = {
      ...child.data,
      author: authorNameInputElement.value,
      comment: commentInputElement.value,
      date: new Date().toLocaleString(),
    }
  }
}

function findAuthorNameAndId(e) {
  let authorName =
    e.target.parentElement.parentElement.firstChild.childNodes[0].nodeValue

  let authorId = Number(e.target.parentElement.parentElement.className.trim())
  return { authorName, authorId }
}

displayComments()
