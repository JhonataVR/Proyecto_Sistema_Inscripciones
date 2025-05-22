from openai import OpenAI

client = OpenAI(
    api_key="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",
    base_url="https://openrouter.ai/api/v1",
)
switch = True


def preguntar(x):
    chat = client.chat.completions.create(
        model="deepseek/deepseek-r1:free", messages=[{"role": "system", "content": "Siempre responde en español y solo habla sobre suma y resta, no referencias a otros temas, ni multiplicacion ni division."},{"role": "user", "content": x}]
    )
    print(chat.choices[0].message.content)

