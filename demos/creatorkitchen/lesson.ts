const assets = '/demos/creatorkitchen/lesson';
function escape(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}
function tooltip(text: string, explanation: string): string {
  return `<span data-type="tooltip" data-tooltip-content="${escape(explanation)}" activeLink="false">${escape(text)}</span>`;
}
function audio(text: string, file: string, translation: string): string {
  const src = `${assets}/${file}.mp3`;
  const click = `Array.from(document.getElementsByTagName('audio')).forEach(audio => { audio.pause(); audio.currentTime = 0; }); const audio = document.getElementById("${src}"); if(audio) audio.play();`;
  return `<span data-type="tooltip" data-tooltip-content="${escape(translation)}" activeLink="true"><span data-type="audiolink" src="${src}" title="${file}.mp3" onclick="${escape(click)}"><audio id="${src}" src="${src}" preload="none"></audio>${escape(text)}</span></span>`;
}
export const lessonTitle = 'Portuguese: the present subjunctive';
export const lessonDescription =
  'A first lesson in wishes, hopes, and possibilities, with pronunciation and practice.';
export const lessonContent = `
<p>You already know how to say what happens. Now learn how to say what you <strong>hope</strong> happens. This lesson uses Brazilian Portuguese, with English explanations and short examples to say out loud.</p>
<h2>Start with something useful</h2>
<p>${audio('Espero que você esteja bem.', 'hope-you-are-well', 'I hope you are well. Esteja is the present subjunctive of estar.')}</p>
<p><em>I hope you are well.</em> You are expressing a hope, rather than simply reporting a fact. The phrase <strong>espero que</strong> introduces that hope; <mark>esteja</mark> is the verb form that follows it.</p>
<div data-type="callout" type="tip"><p><strong>Your goal:</strong> leave with three sentence starters you can actually use: <strong>Espero que…</strong>, <strong>Quero que…</strong>, and <strong>Talvez…</strong>. You do not need every conjugation today.</p></div>
<h2>1. A fact or a wish?</h2>
<table><tbody><tr><th><p>What you mean</p></th><th><p>Portuguese</p></th></tr><tr><td><p>A fact</p></td><td><p>Você <strong>fala</strong> português. <em>You speak Portuguese.</em></p></td></tr><tr><td><p>A hope</p></td><td><p>Espero que você <strong>fale</strong> português hoje. <em>I hope you speak Portuguese today.</em></p></td></tr></tbody></table>
<p>The subjunctive is a ${tooltip('mood', 'A mood shows how the speaker presents an action: as a fact, a wish, a possibility, and so on.')}, not just a new way to say “now.” Its present form can also point toward the future: <em>Espero que amanhã seja um bom dia.</em></p>
<h3>Three friendly starting points</h3>
<ul><li><p><strong>Espero que…</strong> = I hope that…</p></li><li><p><strong>Quero que…</strong> = I want someone else to…</p></li><li><p><strong>Talvez…</strong> = Maybe… <sup>1</sup></p></li></ul>
<p>${audio('Quero que você fale devagar.', 'speak-slowly', 'I want you to speak slowly. Devagar means slowly.')}</p>
<p>${audio('Talvez eu vá ao café.', 'maybe-cafe', 'Maybe I will go to the café. Vá comes from ir, to go.')}</p>
<p><sup>1</sup> When <em>talvez</em> comes before the verb, use the subjunctive in this pattern. Notice that it does <u>not</u> need <em>que</em>.</p>
<hr>
<h2>2. Build the regular forms</h2>
<p>For many verbs, begin with the <strong>eu</strong> form you already know. Remove its final <strong>-o</strong>, then add the new ending. For <strong>-ar</strong> verbs, use the <strong>e</strong> family; for <strong>-er</strong> and <strong>-ir</strong>, use the <strong>a</strong> family.</p>
<ol><li><p><strong>Falar:</strong> eu fal<strong>o</strong> → fal- → que eu fal<mark>e</mark>.</p></li><li><p><strong>Comer:</strong> eu com<strong>o</strong> → com- → que eu com<mark>a</mark>.</p></li><li><p><strong>Abrir:</strong> eu abr<strong>o</strong> → abr- → que eu abr<mark>a</mark>.</p></li></ol>
<h3>A small conjugation card</h3>
<table><tbody><tr><th><p>Verb</p></th><th><p>Person</p></th><th><p>Form</p></th></tr><tr><td rowspan="3"><p><strong>falar</strong></p></td><td><p>eu / você</p></td><td><p>fale</p></td></tr><tr><td><p>nós</p></td><td><p>falemos</p></td></tr><tr><td><p>vocês</p></td><td><p>falem</p></td></tr><tr><td rowspan="3"><p><strong>comer</strong></p></td><td><p>eu / você</p></td><td><p>coma</p></td></tr><tr><td><p>nós</p></td><td><p>comamos</p></td></tr><tr><td><p>vocês</p></td><td><p>comam</p></td></tr><tr><td rowspan="3"><p><strong>abrir</strong></p></td><td><p>eu / você</p></td><td><p>abra</p></td></tr><tr><td><p>nós</p></td><td><p>abramos</p></td></tr><tr><td><p>vocês</p></td><td><p>abram</p></td></tr></tbody></table>
<p><em>Ele</em> and <em>ela</em> use the same form as <em>você</em>; <em>eles</em> and <em>elas</em> use the same form as <em>vocês</em>. Think of the change as V<sub>fact</sub> → V<sub>hope</sub>.</p>
<h4>Keep one sentence recipe</h4>
<pre><code>Espero que + person + subjunctive verb.
Espero que você fale português.
Espero que nós falemos português.</code></pre>
<div data-type="callout" type="warning"><p><strong>Watch the spelling:</strong> some verbs adjust their spelling to keep the same sound. <em>Eu fico</em> becomes <strong>que eu fique</strong>; <em>eu começo</em> becomes <strong>que eu comece</strong>.</p></div>
<h2>3. A few forms to remember</h2>
<p>You will hear these forms often. Treat them as familiar phrases first; the full system can come later.</p>
<table><tbody><tr><th><p>Infinitive</p></th><th><p>eu / você</p></th><th><p>A useful phrase</p></th></tr><tr><td><p>ser</p></td><td><p>seja</p></td><td><p>que seja um bom dia</p></td></tr><tr><td><p>estar</p></td><td><p>esteja</p></td><td><p>que você esteja bem</p></td></tr><tr><td><p>ter</p></td><td><p>tenha</p></td><td><p>que você tenha tempo</p></td></tr><tr><td><p>ir</p></td><td><p>vá</p></td><td><p>talvez eu vá</p></td></tr><tr><td><p>fazer</p></td><td><p>faça</p></td><td><p>que faça sol</p></td></tr></tbody></table>
<p>${audio('É importante que você pratique.', 'practice-is-important', 'It is important that you practice. Pratique comes from praticar.')}</p>
<p>Expressions such as <strong>é importante que</strong> also introduce the subjunctive. Here, the speaker is saying what matters, rather than reporting whether you already practice.</p>
<h2>4. Imagine a good day</h2>
<div data-type="media" type="image" src="${assets}/daydream.svg" alt="A peaceful blue-sky landscape with trees, a path, and a small house" caption="Tomara que faça sol amanhã. (I hope it is sunny tomorrow.)"></div>
<p>${audio('Tomara que faça sol amanhã.', 'hope-sunshine', 'I hope it is sunny tomorrow. Tomara que introduces a wish; faça sol means it is sunny.')}</p>
<p>Look at the scene. What do you hope for tomorrow: ${tooltip('sol', 'Sun or sunshine.')}, ${tooltip('tempo livre', 'Free time.')}, or ${tooltip('uma conversa em português', 'A conversation in Portuguese.')}?</p>
<blockquote><p style="text-align:center">Espero que hoje seja um bom dia.</p><p style="text-align:right"><em>I hope today is a good day.</em></p></blockquote>
<h3>Listen, pause, repeat</h3>
<div data-type="media" type="video" src="${assets}/good-day.mp4" alt="A pronunciation card for Espero que você tenha um bom dia" caption="Listen once, pause, then say the whole sentence out loud."></div>
<p>${audio('Espero que você tenha um bom dia.', 'hope-good-day', 'I hope you have a good day. Tenha is the present subjunctive of ter.')}</p>
<hr>
<h2>5. Your turn</h2>
<p>Complete each sentence before checking the answers. Read the finished sentence aloud.</p>
<ol><li><p>Espero que você <strong>_____</strong> bem. <em>(estar)</em></p></li><li><p>Quero que você <strong>_____</strong> devagar. <em>(falar)</em></p></li><li><p>Talvez eu <strong>_____</strong> ao café. <em>(ir)</em></p></li><li><p>É importante que nós <strong>_____</strong> todos os dias. <em>(praticar)</em></p></li><li><p>Tomara que <strong>_____</strong> sol amanhã. <em>(fazer)</em></p></li></ol>
<h3>Check your answers</h3>
<p>${tooltip('1. esteja', 'Espero que você esteja bem.')} · ${tooltip('2. fale', 'Quero que você fale devagar.')} · ${tooltip('3. vá', 'Talvez eu vá ao café.')} · ${tooltip('4. pratiquemos', 'É importante que nós pratiquemos todos os dias.')} · ${tooltip('5. faça', 'Tomara que faça sol amanhã.')}</p>
<h3>A common mix-up</h3>
<p><s>Espero que você está bem.</s><br><strong>Espero que você <mark>esteja</mark> bem.</strong></p>
<p>Also compare <strong>Quero aprender português</strong> <em>(I want to learn Portuguese)</em> with <strong>Quero que você aprenda português</strong> <em>(I want you to learn Portuguese)</em>. With <em>querer</em>, a change of subject gives you this useful <code>que + subjunctive</code> pattern.</p>
<h3>Make it yours</h3>
<p>Write one wish about today, one about a friend, and one possibility for tomorrow. Start each on a new line with <kbd>Enter</kbd>.</p>
<p>Espero que hoje…</p><p>Quero que meu amigo / minha amiga…</p><p>Talvez amanhã…</p>
<div data-type="callout" type="note"><p><strong>Takeaway:</strong> start with the meaning. Are you stating a fact, expressing a wish, or describing a possibility? A handful of useful sentence frames will get you speaking before every ending feels automatic.</p></div>
<h4>Keep exploring</h4>
<p>Grammar references: <a href="https://www.instituto-camoes.pt/activity/centro-virtual/referencial-camoes-ple-2" target="_blank" rel="noopener noreferrer">Camões: expressing wishes</a> and <a href="https://michaelis.uol.com.br/moderno-portugues/nocoes-gramaticais/verbos/" target="_blank" rel="noopener noreferrer">Michaelis: Portuguese verb forms</a>.</p>
`;
