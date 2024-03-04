// @ts-check
/// <reference types="@atproto/api" />
/// <reference types="coldsky" />

async function dms() {
  console.log('init');
  const dependenciesLoaded = new Promise(resolve => {
    dms.dependenciesLoaded = () => {
      console.log('dependencies loaded OK.');
      resolve();
    };
  });

  console.log('wait for auth');
  // https://bsky.app/settings/app-passwords
  const atClient = await getAuthenticatedBsky();

  async function getAuthenticatedBsky() {
    let loginForm;
    while (true) {
      let auth = loginForm ? await loginForm.login() : getLocalStorageAuth();
      if (!auth) {
        loginForm = showLoginForm();
        auth = await loginForm.login();
      }

      await dependenciesLoaded;

      const atClient = coldsky.ColdskyAgent({ server: 'bsky.social' });
      try {
        await atClient.login({ identifier: auth.username, password: auth.password });
        return atClient;
      } catch (error) {
        console.warn('AUTH ', error);
        loginForm?.showError(error.message || String(error));
      }
    }

    function getLocalStorageAuth() {
      try {
        const auth = localStorage.getItem('AUTH');
        if (auth) {
          const authObj = JSON.parse(auth);
          if (authObj &&
            typeof authObj === 'object' &&
            authObj.username &&
            authObj.password) {
            return authObj;
          }
        }
      } catch (error) {
      }
    }

    function showLoginForm() {
      const loginFORM = document.createElement('form');
      const usernameINPUT = document.createElement('input');
      usernameINPUT.name = 'username';
      usernameINPUT.autocomplete = 'username';
      usernameINPUT.placeholder = 'Username';
      loginFORM.appendChild(usernameINPUT);

      const passwordINPUT = document.createElement('input');
      passwordINPUT.name = 'password';
      passwordINPUT.type = 'password';
      passwordINPUT.autocomplete = 'current-password';
      passwordINPUT.placeholder = 'Password';
      loginFORM.appendChild(passwordINPUT);

      const submitINPUT = document.createElement('input');
      submitINPUT.type = 'submit';
      submitINPUT.value = 'Login';
      loginFORM.appendChild(submitINPUT);

      const errorDIV = document.createElement('div');
      loginFORM.appendChild(errorDIV);

      document.body.appendChild(loginFORM);

      let resolveLoginPromise;
      let loginPromise = new Promise(resolve => resolveLoginPromise = resolve);

      submitINPUT.onclick = e => {
        e.preventDefault?.();
        e.stopPropagation?.();

        if (!usernameINPUT.value || !passwordINPUT.value)
          return;

        resolveLoginPromise?.({
          username: usernameINPUT.value,
          password: passwordINPUT.value
        });

        loginPromise = new Promise(resolve => resolveLoginPromise = resolve);
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

  }

} dms();