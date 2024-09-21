import type { WidgetConfig } from '@medusajs/admin'
import React, {Dispatch, SetStateAction, useEffect, useRef} from 'react'
import { User } from '@firebase/auth'
import { useNavigate } from 'react-router-dom'
import firebaseUIAuth, { uiConfig } from '../utils/firebase-util'
import FirebaseAuth from '../components/shared/FirebaseAuth'
// @ts-ignore
import useNotification from '../../hooks/use-notification'
// @ts-ignore
import { getErrorMessage } from '../../utils/error-messages'

const FirebaseUIWidget = ({login}: { login?:
        {
            token ? : string,
            acceptInvite ? : (data: {
                token: string
                user: {
                    first_name: string
                    last_name: string
                    password: string
                }
            }) => Promise<void>
            setOnLogoutSuccess?: Dispatch<SetStateAction<(()=> Promise<void>) | null>>
        }
}) => {
    const navigate = useNavigate()
    const notification = useNotification()
    const {token, acceptInvite, setOnLogoutSuccess} = login || {}
    const isSignInRef = useRef(false);
    useEffect(() => setOnLogoutSuccess?.(firebaseUIAuth.logout), [setOnLogoutSuccess]);
    return setOnLogoutSuccess?<div/>:(
        <div>
            <h1>FirebaseUIWidget Widget</h1>
            <div>
                <FirebaseAuth
                    firebaseAuth={firebaseUIAuth.firebaseAuth}
                    uiConfig={{
                        ...uiConfig,
                        callbacks: {
                            signInSuccessWithAuthResult: () => false,
                        },
                    }}
                    onAuthenticated ={(user: User) => {
                        if(!isSignInRef.current){
                            isSignInRef.current = true
                            const doLogin = () => user.getIdToken().then((token) => {
                                firebaseUIAuth.firebaseLogin(token).then((session) => {
                                    console.log('firebaseLogin session', session)
                                    if(session?.status===200) navigate('/')
                                    else notification('Error! Please try again', session?.statusText, 'error')
                                }).catch(err => {
                                    notification('Error! Please try again', getErrorMessage(err), 'error')
                                    console.log('error when auth',err)
                                }).finally(() => isSignInRef.current = false)
                            })
                            if(token && acceptInvite){
                                acceptInvite({
                                    token,
                                    user:{
                                        first_name: user.displayName,
                                        last_name: user.displayName,
                                        password: Math.random().toString(36).slice(-8)
                                    }
                                }).then(() => doLogin()).catch(err => {
                                    notification('Accept Error! Please try again', getErrorMessage(err), 'error')
                                    console.log('error when auth',err)
                                }).finally(() => isSignInRef.current = false)
                            } else doLogin()
                        }
                    }}
                />
            </div>
        </div>
    )
}

export const config: WidgetConfig = {
    zone: "login.after",
}

export default FirebaseUIWidget