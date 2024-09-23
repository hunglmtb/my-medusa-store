import React, { useEffect, useRef, useState } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from 'firebaseui'
// TODO improve file size
import 'firebaseui/dist/firebaseui.css'

/**
 * React wrapper for the FirebaseUI Auth widget.
 */

const FirebaseAuth = (props) => {
  const { firebaseAuth, className, uiCallback, uiConfig, onAuthenticated } = props

  const [userSignedIn, setUserSignedIn] = useState(false)

  const elementRef = useRef(null)

  useEffect(() => {
    if (auth === null) {
      return
    }

    // Get or Create a firebaseUI instance.
    const firebaseUiWidget = auth.AuthUI.getInstance() || new auth.AuthUI(firebaseAuth)

    if (uiConfig.signInFlow === 'popup') {
      firebaseUiWidget.reset()
    }

    // We track the auth state to reset firebaseUi if the user signs out.
    const unregisterAuthObserver = onAuthStateChanged(firebaseAuth, (user) => {
      if (!user && userSignedIn) {
        firebaseUiWidget.reset()
      }
      setUserSignedIn(!!user)
      console.log('user firebase', user)
      if (user) onAuthenticated?.(user)
    })

    // Trigger the callback if any was set.
    if (uiCallback) {
      uiCallback(firebaseUiWidget)
    }

    // Render the firebaseUi Widget.
    firebaseUiWidget.start(elementRef.current, uiConfig)

    return () => {
      unregisterAuthObserver()
      firebaseUiWidget.reset()
    }
  }, [uiConfig])

  return <div className={className} ref={elementRef} />
}

export default FirebaseAuth
