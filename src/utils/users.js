const users=[]

// addUser, removeUser, getUser, getUsersInRoom

const addUser=({ id,username,room })=>{
    // Clean the data
    username=username.trim().toLowerCase()
    room=room.trim().toLowerCase()

    // validate the data
    if(!username || !room){
        return {
            error:"Username and room are required!"
        }
    }

    // check for existing user
    const existingUser=users.find((user)=>{
        return user.room === room && user.username === username
    })

    // Validate username
    if(existingUser){
        return {
            error:"Username is in use!!"
        }
    }

    // Store user
    const user={id,username,room}
    users.push(user)
    return { user }
}

const removeUser=(id)=>{
    const index=users.findIndex((user)=>{
        return user.id===id
    })
    if(index!==-1){
        return users.splice(index,1)[0]
    }
}

const getUser=(id)=>{
    if(users.length!=0){
        return users.find((user)=>user.id===id)
    }
}

const getUsersInRoom=(room)=>{
    room=room.toLowerCase()
    return users.filter((user)=>{
        return user.room===room
    })
}

module.exports={
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}

// addUser({
//     id:22,
//     username:'Himanshu',
//     room: 'Noida'
// })

// addUser({
//     id:23,
//     username:'H',
//     room: 'Noida'
// })

// addUser({
//     id:24,
//     username:'I',
//     room: 'Noida'
// })

// addUser({
//     id:25,
//     username:'Himanshu',
//     room: 'Delhi'
// })

// console.log("Users::",users)

// const user=getUser(240)
// console.log("Get User by it's id::",user)

// const userList=getUsersInRoom('Delhi')
// console.log("User list from given room:",userList)

// // console.log(users)

// // const res=addUser({
// //     id:33,
// //     username:'Himanshu',
// //     room:'Noida'
// // })

// // console.log(res)

// // const removeUSer=removeUser(22)
// // console.log(removeUSer)
// // console.log(users)