(() => {
  var __async = (__this, __arguments, generator) => {
    return new Promise((resolve, reject) => {
      var fulfilled = (value) => {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      };
      var rejected = (value) => {
        try {
          step(generator.throw(value));
        } catch (e) {
          reject(e);
        }
      };
      var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
      step((generator = generator.apply(__this, __arguments)).next());
    });
  };

  // src/index.js
  function dms() {
    return __async(this, null, function* () {
      console.log("init");
      const dependenciesLoaded = new Promise((resolve) => {
        dms.dependenciesLoaded = () => {
          console.log("dependencies loaded OK.");
          resolve();
        };
      });
      console.log("wait for auth");
      const atClient = yield getAuthenticatedBsky();
      function getAuthenticatedBsky() {
        return __async(this, null, function* () {
          let loginForm;
          while (true) {
            let auth = loginForm ? yield loginForm.login() : getLocalStorageAuth();
            if (!auth) {
              loginForm = showLoginForm();
              auth = yield loginForm.login();
            }
            yield dependenciesLoaded;
            const atClient2 = coldsky.ColdskyAgent({ server: "bsky.social" });
            try {
              yield atClient2.login({ identifier: auth.username, password: auth.password });
              return atClient2;
            } catch (error) {
              console.warn("AUTH ", error);
              loginForm == null ? void 0 : loginForm.showError(error.message || String(error));
            }
          }
          function getLocalStorageAuth() {
            try {
              const auth = localStorage.getItem("AUTH");
              if (auth) {
                const authObj = JSON.parse(auth);
                if (authObj && typeof authObj === "object" && authObj.username && authObj.password) {
                  return authObj;
                }
              }
            } catch (error) {
            }
          }
          function showLoginForm() {
            const loginFORM = document.createElement("form");
            const usernameINPUT = document.createElement("input");
            usernameINPUT.name = "username";
            usernameINPUT.autocomplete = "username";
            usernameINPUT.placeholder = "Username";
            loginFORM.appendChild(usernameINPUT);
            const passwordINPUT = document.createElement("input");
            passwordINPUT.name = "password";
            passwordINPUT.type = "password";
            passwordINPUT.autocomplete = "current-password";
            passwordINPUT.placeholder = "Password";
            loginFORM.appendChild(passwordINPUT);
            const submitINPUT = document.createElement("input");
            submitINPUT.type = "submit";
            submitINPUT.value = "Login";
            loginFORM.appendChild(submitINPUT);
            const errorDIV = document.createElement("div");
            loginFORM.appendChild(errorDIV);
            document.body.appendChild(loginFORM);
            let resolveLoginPromise;
            let loginPromise = new Promise((resolve) => resolveLoginPromise = resolve);
            submitINPUT.onclick = (e) => {
              var _a, _b;
              (_a = e.preventDefault) == null ? void 0 : _a.call(e);
              (_b = e.stopPropagation) == null ? void 0 : _b.call(e);
              if (!usernameINPUT.value || !passwordINPUT.value)
                return;
              resolveLoginPromise == null ? void 0 : resolveLoginPromise({
                username: usernameINPUT.value,
                password: passwordINPUT.value
              });
              loginPromise = new Promise((resolve) => resolveLoginPromise = resolve);
            };
            return {
              showError: (err) => {
                errorDIV.textContent = err;
              },
              login: () => loginPromise,
              remove: () => {
                loginFORM.remove();
              }
            };
          }
        });
      }
    });
  }
  dms();
})();
//# sourceMappingURL=index.js.map
