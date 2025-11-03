'use client'

import React from 'react'

const Page = () => {
    // const logout = async () => {

    //     try {
    //         const logoutDone = await fetch('/api/logout', { method: 'POST', credentials: "include" })
    //         if (logoutDone.ok) {
    //            window.location.href='/'

    //         }
    //     } catch (error) {
    //         console.error(error);
    //     }
    // }
    // return (
    //     <button className ="bg-red h-3 w-3" onClick={logout}>Lgout</button>
    // )



    const tests = async () => {

        try {
            const refresh = await fetch('api/auth/refresh', { method: 'POST', credentials: 'include' })
            console.log(refresh)
        } catch (error) {
            console.error(error);
        }


    }
    return (
        <button onClick={tests}>refresh</button>
    )
}

export default Page