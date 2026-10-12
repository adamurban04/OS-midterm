// Tokenise strings before identifiers so keywords inside strings remain strings.
const tokens =
  /("(?:\\.|[^"\\])*"|\/\/.*$|^\s*#.*$|\b(?:int|void|return|if|NULL|pid_t|pthread_t|pthread_mutex_t)\b|\b(?:fork|printf|exit|wait|pthread_create|pthread_join|pthread_mutex_lock|pthread_mutex_unlock)\b|\b\d+\b)/gm;
export function CodeBlock({
  code,
  label = "C · source example",
}: {
  code: string;
  label?: string;
}) {
  return (
    <div className="code-block">
      <div className="code-label">
        <span>{label}</span>
        <span aria-hidden="true">● ● ●</span>
      </div>
      <pre>
        <code>
          {code.split("\n").map((line, i) => (
            <span className="code-line" key={i}>
              <span className="line-number" aria-hidden="true">
                {i + 1}
              </span>
              <span>
                {line
                  .split(tokens)
                  .filter((t) => t !== undefined && t !== "")
                  .map((t, j) => {
                    let cls = "";
                    if (t.startsWith('"')) cls = "syntax-string";
                    else if (t.trim().startsWith("#")) cls = "syntax-include";
                    else if (
                      /^(int|void|return|if|NULL|pid_t|pthread_t|pthread_mutex_t)$/.test(
                        t,
                      )
                    )
                      cls = "syntax-keyword";
                    else if (/^(fork|printf|exit|wait|pthread_)/.test(t))
                      cls = "syntax-call";
                    else if (/^\d+$/.test(t)) cls = "syntax-number";
                    return (
                      <span className={cls} key={j}>
                        {t}
                      </span>
                    );
                  })}
              </span>
              {"\n"}
            </span>
          ))}
        </code>
      </pre>
    </div>
  );
}
