function addDarkModeWidget() {
    const options = {
        bottom: "98px", // default: '32px'
        right: "32px", // default: '32px'
        left: "unset", // default: 'unset'
        time: "0.8s", // default: '0.3s'
        mixColor: "#fff", // default: '#fff'
        backgroundColor: "#fff", // default: '#fff'
        buttonColorDark: "#100f2c", // default: '#100f2c'
        buttonColorLight: "#fff", // default: '#fff'
        saveInCookies: true, // default: true,
        label: "🌓", // default: ''
        autoMatchOsTheme: true, // default: true
    };

    const darkMode = new Darkmode(options);
    darkMode.showWidget();
}

window.addEventListener("load", addDarkModeWidget);
