// =================== Scratch extension =================== 

// auto arguments is a little over complicated to deduce argument count

const letter = i => String.fromCharCode(97+i)

const auto_block = (blockType, opcode, text, args) => ({
	blockType,
	opcode,
	text,
	arguments: Object.fromEntries(
		new Array(text.split('[').length-1).fill().map((_,i)=> [
			letter(i), {
				type: (args && args[i]) || "string", 
				defaultValue: " "
			}
		])
	)
})
const mat_reporter_f = f => o => to_s(f(...new Array(Object.entries(o).length).fill().map((_,i)=> from_s(o[letter(i)]))))

class ScratchMath {

	constructor(runtime) {
		this.runtime = runtime
		this.tempElem = document.createElement("link")
			this.tempElem.rel = "stylesheet"
			this.tempElem.type = "text/css"
			this.tempElem.href = "https://scratchjs.crossscar.repl.co/styles.css"
			document.head.appendChild(this.tempElem)
			
			this.consoleElem = document.createElement("div")
			this.consoleElems = {}
			this.consoleElem.classList.add("ScratchJS-console")
			this.consoleElems.clearBtn = document.createElement("button")
			this.consoleElems.clearBtn.classList.add("ScratchJS-console-clear")
			this.consoleElems.clearBtn.innerHTML = "X"
			this.consoleElems.clearBtn.title = "Clear Console"
			this.consoleElem.appendChild(this.consoleElems.clearBtn)
			document.querySelector(".stage-wrapper_stage-wrapper_2bejr").appendChild(this.consoleElem)

			this.consoleElems.clearBtn.addEventListener("click", () => {
				this.console.clear()
			})
	}

	getInfo() {
	    return {
		// fill    
		color1: '#ff6680',
		// outline
		color2: '#ff3355',
	    	id: "math",
	    	name: "JS",
	    	blocks: [
		auto_block('reporter', "completePrompt", "羊 complete prompt [a]"),
		auto_block('reporter', "Fetch", "羊 fetch [a]")
	        {
	        	blockType: 'command',
	        	opcode: 'EvalCmd',
	        	text: '羊 run [a]',
	        	arguments: {
	        		a: {
	        			type: "string",
	        			defaultValue: " "
	        		},
				PATH: {
	        			type: "string",
	        			defaultValue:" "
	        		},
				JSON_STRING: {
	        			type: "string",
	        			defaultValue:" "
	        		},
	        		b: {
	        			type: "string",
	        			defaultValue:" "
	        		}
				
	        	}
	        },

	        '---',

	        
	    	],
	    	
	    }
	}

	EvalCmd({a}) {
		try {
eval(a)
  

} catch (err) {

  alert(err)

}
	}

	async completePrompt({a}) {
        //Remove trailing spaces, required for model to work properly
        const text = a.trim();
        //Request text completion using Davinci3
        const url = `https://api.openai.com/v1/engines/davinci3/completions`;

        const options = {
            //Has to be post for some reason
            method: "POST",
            //Input prompt and a decent length
            body: JSON.stringify({
                prompt: text,
                max_tokens: 300,
            }),
            //API key, and JSON content type
            headers: {
                Authorization: "Bearer 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",
                "Content-type": "application/json; charset=UTF-8"
            },
        };

        console.log("REQUEST:" + url);

        //Fetch and await promise.
        const response = await fetch(url, options);
        //Get JSON data
        const jsonData = await response.json();

        //The ai response will be the first (and only) choices text
        const output = jsonData.choices[0].text;
        return output;
}

	Fetch({a}) {
    let file = a;
    return fetch(file)
        .then(x => x.text())
        .then(y => {
            let ans = y;
            return ans;
        });
}
	parseJSON({PATH, JSON_STRING}) {
    const path = PATH.toString().split('/').map(prop => decodeURIComponent(prop));
    if (path[0] === '') path.splice(0, 1);
    if (path[path.length - 1] === '') path.splice(-1, 1);
    let json;
    try {
    	json = JSON.parse(' ' + JSON_STRING);
    } catch (e) {
	    return e.message;
    }
		path.forEach(prop => json = json[prop]);
		if (json === null) return 'null';
		else if (json === undefined) return '';
		else if (typeof json === 'object') return JSON.stringify(json);
		else return json.toString();
	  }
	
}

// ============== globalize vm and load extension ===============

function findReactComponent(element) {
    let fiber = element[Object.keys(element).find(key => key.startsWith("__reactInternalInstance$"))];
    if (fiber == null) return null;

    const go = fiber => {
        let parent = fiber.return;
        while (typeof parent.type == "string") {
            parent = parent.return;
        }
        return parent;
    };
    fiber = go(fiber);
    while(fiber.stateNode == null) {
        fiber = go(fiber);
    }
    return fiber.stateNode;
}

window.vm = findReactComponent(document.getElementsByClassName("stage-header_stage-size-row_14N65")[0]).props.vm;

(function() {
    var extensionInstance = new ScratchMath(window.vm.extensionManager.runtime)
    var serviceName = window.vm.extensionManager._registerInternalExtension(extensionInstance)
    window.vm.extensionManager._loadedExtensions.set(extensionInstance.getInfo().id, serviceName)
})()
