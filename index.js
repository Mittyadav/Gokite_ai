require('axios');
const fs = require('fs');
const figlet = require('figlet');
const chalk = require('chalk');
const gradient = require('gradient-string');
const boxen = require('boxen');
const readline = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

// Agent List
const agents = {
  "deployment_p5J9lz1Zxe7CYEoo0TZpRVay": "Professor 🧠",
  "deployment_7sZJSiCqCNDy9bBHTEh7dwd9": "Crypto Buddy 💰",
  "deployment_SoFftlsf9z4fyA3QCHYkaANq": "Sherlock 🔎"
};

// Display App Title in Style
function displayAppTitle() {
  const title = figlet.textSync('SCRIPTHUB00', { horizontalLayout: 'full' });
  const gradientTitle = gradient.pastel.multiline(title);

  const boxContent = `
  ${gradientTitle}
  ${chalk.dim('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')}
  ${chalk.gray('By DARK LIFE 🧬 Join TG -')} ${chalk.cyan('https://t.me/SCRIPTHUB00')}
  ${chalk.dim('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')}
  `;

  console.log(
    boxen(boxContent, {
      padding: 1,
      margin: 1,
      borderStyle: 'double',
      borderColor: 'cyan',
    })
  );
}


async function sendRandomQuestion(agent) {
  try {
    const randomQuestions = JSON.parse(fs.readFileSync('random_questions.json', 'utf-8'));
    const randomQuestion = randomQuestions[Math.floor(Math.random() * randomQuestions.length)];

    const payload = { message: randomQuestion, stream: false };
    const response = await axios.post(`https://${agent.toLowerCase().replace('_','-')}.stag-vxzy.zettablock.com/main`, payload, {
      headers: { 'Content-Type': 'application/json' }
    });

    return { question: randomQuestion, response: response.data.choices[0].message };
  } catch (error) {
    console.error(chalk.red('⚠️ Error:'), error.response ? error.response.data : error.message);
  }
}

async function reportUsage(wallet, options) {
  try {
    const payload = {
      wallet_address: wallet,
      agent_id: options.agent_id,
      request_text: options.question,
      response_text: options.response,
      request_metadata: {}
    };

    await axios.post(`https://quests-usage-dev.prod.zettablock.com/api/report_usage`, payload, {
      headers: { 'Content-Type': 'application/json' }
    });

    console.log(chalk.green('✅ Data penggunaan berhasil dilaporkan!\n'));
  } catch (error) {
    console.error(chalk.red('⚠️ Gagal melaporkan penggunaan:'), error.response ? error.response.data : error.message);
  }
}

async function main() {
  displayAppTitle();

  readline.question(chalk.yellow('🔑 Enter Your Metamask wallet address: '), async (wallet) => {
    readline.question(chalk.yellow('🔢 No. of interactions with each agent : '), async (input) => {
      const iterations = parseInt(input) || 1;
      console.log(chalk.blue(`\n📌 Wallet address: ${wallet}`));
      console.log(chalk.blue(`📊 Iteractions per agent: ${iterations}\n`));

      for (const [agentId, agentName] of Object.entries(agents)) {
        console.log(chalk.magenta(`\n🤖 Menggunakan Agent: ${agentName}`));
        console.log(chalk.dim('----------------------------------------'));

        for (let i = 0; i < iterations; i++) {
          console.log(chalk.yellow(`🔄 Iterasi ke-${i + 1}`));
          const nanya = await sendRandomQuestion(agentId);
          console.log(chalk.cyan('❓ Pertanyaan:'), chalk.bold(nanya.question));
          console.log(chalk.green('💡 Jawaban:'), chalk.italic(nanya?.response?.content ?? ''));

          await reportUsage(wallet.toLowerCase(), {
            agent_id: agentId,
            question: nanya.question,
            response: nanya?.response?.content ?? 'Tidak ada jawaban'
          });
        }

        console.log(chalk.dim('----------------------------------------'));
      }

      console.log('\n ThnakYou For Using Kite Ai Auto Script Please Join TG @scripthub00.');
      readline.close();
    });
  });
}

main();
