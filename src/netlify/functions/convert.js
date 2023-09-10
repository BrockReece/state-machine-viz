exports.handler = async function (event, context) {
  // your server-side functionality
  console.log(JSON.parse(event.body))

  return {
    statusCode: 200,
    body: `
    <body>
      <iframe data-xstate width="100%" height="100%"></iframe>
    </body>
    
    <script>
        const { inspect } = XStateInspect;
        const { interpret, createMachine } = XState; // global variable: window.XState
    
        inspect({
          iframe: () => document.querySelector("iframe[data-xstate]"),
        })

        const djangoFSM = ${event.body.content}
    
        const lightMachine = createMachine({
          id: 'light',
          initial: 'published',
          context: {
            role: 'owner'
          },
          states: djangoFSM.states.reduce((agg, state) => {
            agg[state] = {
                on: djangoFSM.transitions.filter((t) => t.source.includes(state)).reduce((tAgg, transition) => {
                    tAgg[transition.trigger] = {
                      target: transition.dest
                    }
    
                    return tAgg
                }, {}),
            }
            
            return agg
          }, {}),
          
        });
    
        const lightService = interpret(lightMachine, { devTools: true, guards: {
            allowedBy: (context, event, { cond }) => { 
              console.log(cond)
              return cond.roles.includes(context.roles)
            }
          } }).start({});
    </script>
    `
  };
};