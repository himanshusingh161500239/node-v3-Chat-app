const socket=io()


// Elements
const $messageForm=document.querySelector('#message-form')
const $messageFormInput=$messageForm.querySelector('input')
const $messageFormButton=$messageForm.querySelector('button')
const $locationButton=document.querySelector('#send-location')
const $messages=document.querySelector('#messages')
// socket.on('countUpdated',(count)=>{
//     console.log("The count has been updated!!",count)
// })


// // added additionally event listener to make sure that query selector runs when all DOM content loaded
// document.addEventListener('DOMContentLoaded',()=>{
//     document.querySelector('#increment').addEventListener('click',()=>{
//         socket.emit('increment')
//     })
// })

//Templates
const messageTemplate=document.querySelector('#message-template').innerHTML
const locationUrlTempelate=document.querySelector('#locationUrl-template').innerHTML
const slidebarTempelate=document.querySelector('#sidebar-template').innerHTML

//options
const { username,room } = Qs.parse(location.search,{ignoreQueryPrefix:true})
// console.log("Username:: ",username,",Room: ",room)

const autoscroll=()=>{
    // new message element
    const $newMessage=$messages.lastElementChild

    // Height of the new message
    const newMessageStyles=getComputedStyle($newMessage)
    const newMessageMargin=parseInt(newMessageStyles.marginBottom)
    const newMesageHeight=$newMessage.offsetHeight + newMessageMargin

    // Visible height
    const visibleHeight=$messages.offsetHeight

    // height of messages container
    const containerHeight=$messages.scrollHeight

    // How far have i scrolled?
    const scrollOfset=$messages.scrollTop +visibleHeight

    if(containerHeight - newMesageHeight <= scrollOfset){
        $messages.scrollTop=$messages.scrollHeight
    }
}

socket.on('message',(message)=>{
    console.log(message)
    const html=Mustache.render(messageTemplate,{
        username:message.username,
        message:message.text,
        createdAt:moment(message.createdAt).format('h:mm a') 
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoscroll()
})

socket.on('locationMessage',(locationUrl)=>{
    console.log("Location Url::",locationUrl)
    const html=Mustache.render(locationUrlTempelate,{
        username:locationUrl.username,
        locationUrl:locationUrl.url,
        createdAt:moment(locationUrl.createdAt).format('h:mm a') 
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoscroll()
})

socket.on('roomData',({ room,users})=>{
    const html=Mustache.render(slidebarTempelate,{
        room,
        users
    })
    document.querySelector("#sidebar").innerHTML=html
})


document.addEventListener('DOMContentLoaded',()=>{
    $messageForm.addEventListener('submit',(e)=>{
        e.preventDefault()
        // disable the form when it got submit
        $messageFormButton.setAttribute('disabled','disabled')
        const message=e.target.elements.message.value
        socket.emit('sendMessage',message,(error)=>{
            $messageFormButton.removeAttribute('disabled')
            $messageFormInput.value=''
            $messageFormInput.focus()
            if(error){
                return console.log(error)
            }
            console.log("The message was delivered!!")
        })
    })
    $locationButton.addEventListener('click',(e)=>{
        if(!navigator.geolocation){
            return alert('Geolocation is not supported by your browser')
        }
        $locationButton.setAttribute('disabled','disabled')
        navigator.geolocation.getCurrentPosition((position)=>{
            // console.log(position)
            const latitude=position.coords.latitude
            const longitude=position.coords.longitude
            // console.log("Latitude and Longitude::",latitude,longitude)
            socket.emit('location',{latitude,longitude},()=>{
                $locationButton.removeAttribute('disabled')
                console.log("Location shared!!")
            })
        })

    })
})

socket.emit('join',{username,room},(error)=>{
    if(error){
        alert(error)
        location.href='/'
    }
})





