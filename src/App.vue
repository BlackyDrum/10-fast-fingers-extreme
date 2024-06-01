<script setup>
import {onBeforeUnmount, onMounted, ref} from "vue";
import wordList from "an-array-of-english-words";

import InputText from "primevue/inputtext";

const words = ref([]);
const currentWordIndex = ref(0);
const currentCharacterIndex = ref(0);
const isInvalidWord = ref(false);

const input = ref("");
const inputRef = ref();

onMounted(() => {
  document.addEventListener('paste', disablePaste)

  init();

  inputRef.value.$el.focus();
});

onBeforeUnmount(() => {
  document.removeEventListener('paste', disablePaste)
})

const init = () => {
  for (let i = 0; i < 50; i++) {
    const index = Math.floor(Math.random() * wordList.length);
    words.value.push(wordList[index]);
  }
}

const disablePaste = (event) => {
  event.preventDefault();
}

const handleInput = (event) => {
  const pressedKey = event.data;
  const currentWord = words.value[currentWordIndex.value];
  const currentChar = currentWord[currentCharacterIndex.value];

  if (currentWord.startsWith(input.value)) {
    isInvalidWord.value = false;
  }

  if (event.inputType === "deleteContentBackward" && currentWord.startsWith(input.value)) {
    currentCharacterIndex.value = input.value.length
    return;
  }

  if (currentChar === pressedKey && !isInvalidWord.value) {
    currentCharacterIndex.value++;
    if (currentCharacterIndex.value === currentWord.length) {
      currentWordIndex.value++;
      currentCharacterIndex.value = 0;

      input.value = "";
    }
  } else if (!currentWord.startsWith(input.value)) {
    isInvalidWord.value = true;
  }
};
</script>

<template>
  <header>
    <div class="flex">
      <div class="mx-auto mt-10">
        <h1 class="text-4xl">
          10 Fast Fingers <span class="text-red-300">extreme</span>
        </h1>
      </div>
    </div>
  </header>

  <main>
    <div class="mt-20 flex">
      <div class="flex w-full flex-col">
        <div
          class="mx-auto flex h-[205px] w-[1000px] flex-wrap gap-2 overflow-hidden break-words bg-[#343434] p-2 text-2xl"
        >
          <div v-for="(word, wIdx) in words">
            <span
              v-for="(char, cIdx) in word"
              class="mx-[1px]"
              :class="{
                'border bg-gray-600':
                  wIdx === currentWordIndex && cIdx === currentCharacterIndex,
              }"
            >
              {{ char }}
            </span>
          </div>
        </div>
        <div class="mx-auto mt-4 w-[1000px]">
          <InputText
            v-model="input"
            @input="handleInput"
            ref="inputRef"
            class="w-full bg-[#343434] text-white focus:border-red-100"
            :class="{ invalid: isInvalidWord }"
          />
        </div>
      </div>
    </div>
  </main>
</template>

<style>
.invalid:focus,
.invalid {
  border-color: #ff0000;
  outline: none;
}
</style>
