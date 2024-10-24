<script setup>
import { ref, onMounted } from 'vue';
import CommentSection from './components/CommentSection.vue';

const HOST_NAME = 'http://localhost:3000';

const userId = ref('');
const users = ref(null);
const newEmail = ref('');
const csrfToken = ref('');

onMounted(() => {
  fetchCsrfToken();
});

const sanitizeHTML = (htmlString) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlString, 'text/html');
  const allowedTags = ['b', 'i', 'em', 'strong', 'a', 'p', 'div', 'span', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li'];

  doc.body.querySelectorAll('*').forEach((element) => {
    if (!allowedTags.includes(element.tagName.toLowerCase())) {
      element.remove();
    }
  });

  return doc.body.innerHTML;
};

// Fetch user data from the server
const getUser = async () => {
  const response = await fetch(`${HOST_NAME}/api/user/${userId.value}`);
  const data = await response.json();

  users.value = data.map(user => ({
    name: sanitizeHTML(user.name),
    email: sanitizeHTML(user.email),
  }));
};

const changeEmail = async () => {
  fetchCsrfToken();
  console.log(csrfToken.value)
  await fetch(`${HOST_NAME}/api/user/${userId.value}/change-email`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'CSRF-Token': csrfToken.value,
    },
    credentials: 'include',  // Make sure this is included
    body: new URLSearchParams({
      email: sanitizeHTML(newEmail.value),
    }).toString(),
  });

};

const fetchCsrfToken = async () => {
  const response = await fetch(`${HOST_NAME}/api/csrf-token`, {
    credentials: 'include',
  });
  const data = await response.json();
  csrfToken.value = data.csrfToken;
};
</script>

<template>
  <div id="app">
    <h1>User Dashboard</h1>
    <div>
      <input type="number" v-model="userId" placeholder="Enter User ID" />
      <button @click="getUser">Get User Info</button>
    </div>
    <div v-if="users">
      <template v-for="user in users" :key="user.email">
        <h2 v-html="user.name"></h2>
        <p v-html="'Email: ' + user.email"></p>
        <hr />
      </template>
    </div>
    <CommentSection />
    <form @submit.prevent="changeEmail">
      <h3>Change Email</h3>
      <input v-model="newEmail" placeholder="New Email" type="email">
      <button type="submit">Submit</button>
    </form>
  </div>
</template>
