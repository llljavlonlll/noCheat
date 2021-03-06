import React from "react";
import ReactDOM from "react-dom";
import configureStore from "./store/configureStore";
import { Provider } from "react-redux";
import Cookies from "js-cookie";
import App from "./App";
import { setLocale } from "./store/actions/localeActions";
import { checkIfLoggedIn } from "./store/actions/authActions";

const store = configureStore();

if (localStorage.language) {
    store.dispatch(setLocale(localStorage.language));
} else {
    var language = window.navigator.userLanguage || window.navigator.language;
    store.dispatch(setLocale(language));
}
if (Cookies.get("token")) {
    store.dispatch(checkIfLoggedIn());
}

const app = (
    <Provider store={store}>
        <App />
    </Provider>
);

ReactDOM.render(app, document.getElementById("root"));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
