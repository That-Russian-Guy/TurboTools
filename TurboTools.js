/*
   This extension was made with TurboBuilder!
   https://turbobuilder-steel.vercel.app/
*/
(async function(Scratch) {
    const variables = {};
    const blocks = [];
    const menus = {};


    if (!Scratch.extensions.unsandboxed) {
        alert("This extension needs to be unsandboxed to run!")
        return
    }

    function doSound(ab, cd, runtime) {
        const audioEngine = runtime.audioEngine;

        const fetchAsArrayBufferWithTimeout = (url) =>
            new Promise((resolve, reject) => {
                const xhr = new XMLHttpRequest();
                let timeout = setTimeout(() => {
                    xhr.abort();
                    reject(new Error("Timed out"));
                }, 5000);
                xhr.onload = () => {
                    clearTimeout(timeout);
                    if (xhr.status === 200) {
                        resolve(xhr.response);
                    } else {
                        reject(new Error(`HTTP error ${xhr.status} while fetching ${url}`));
                    }
                };
                xhr.onerror = () => {
                    clearTimeout(timeout);
                    reject(new Error(`Failed to request ${url}`));
                };
                xhr.responseType = "arraybuffer";
                xhr.open("GET", url);
                xhr.send();
            });

        const soundPlayerCache = new Map();

        const decodeSoundPlayer = async (url) => {
            const cached = soundPlayerCache.get(url);
            if (cached) {
                if (cached.sound) {
                    return cached.sound;
                }
                throw cached.error;
            }

            try {
                const arrayBuffer = await fetchAsArrayBufferWithTimeout(url);
                const soundPlayer = await audioEngine.decodeSoundPlayer({
                    data: {
                        buffer: arrayBuffer,
                    },
                });
                soundPlayerCache.set(url, {
                    sound: soundPlayer,
                    error: null,
                });
                return soundPlayer;
            } catch (e) {
                soundPlayerCache.set(url, {
                    sound: null,
                    error: e,
                });
                throw e;
            }
        };

        const playWithAudioEngine = async (url, target) => {
            const soundBank = target.sprite.soundBank;

            let soundPlayer;
            try {
                const originalSoundPlayer = await decodeSoundPlayer(url);
                soundPlayer = originalSoundPlayer.take();
            } catch (e) {
                console.warn(
                    "Could not fetch audio; falling back to primitive approach",
                    e
                );
                return false;
            }

            soundBank.addSoundPlayer(soundPlayer);
            await soundBank.playSound(target, soundPlayer.id);

            delete soundBank.soundPlayers[soundPlayer.id];
            soundBank.playerTargets.delete(soundPlayer.id);
            soundBank.soundEffects.delete(soundPlayer.id);

            return true;
        };

        const playWithAudioElement = (url, target) =>
            new Promise((resolve, reject) => {
                const mediaElement = new Audio(url);

                mediaElement.volume = target.volume / 100;

                mediaElement.onended = () => {
                    resolve();
                };
                mediaElement
                    .play()
                    .then(() => {
                        // Wait for onended
                    })
                    .catch((err) => {
                        reject(err);
                    });
            });

        const playSound = async (url, target) => {
            try {
                if (!(await Scratch.canFetch(url))) {
                    throw new Error(`Permission to fetch ${url} denied`);
                }

                const success = await playWithAudioEngine(url, target);
                if (!success) {
                    return await playWithAudioElement(url, target);
                }
            } catch (e) {
                console.warn(`All attempts to play ${url} failed`, e);
            }
        };

        playSound(ab, cd)
    }
    class Extension {
        getInfo() {
            return {
                "id": "newo",
                "name": "TurboTools",
                "color1": "#ff4b4b",
                "color2": "#ce3b3b",
                "color3": "#ce3b3b",
                "blocks": blocks,
                "menus": menus
            }
        }
    }
    blocks.push({
        opcode: "bo001",
        blockType: Scratch.BlockType.BOOLEAN,
        text: "[A] === [B]",
        arguments: {
            "A": {
                type: Scratch.ArgumentType.STRING,
                defaultValue: '',
            },
            "B": {
                type: Scratch.ArgumentType.STRING,
                defaultValue: '',
            },
        },
        disableMonitor: true,
        isEdgeActivated: false
    });
    Extension.prototype["bo001"] = async (args, util) => {
        return (args["A"] === args["B"])
    };

    blocks.push({
        opcode: "bo002",
        blockType: Scratch.BlockType.BOOLEAN,
        text: "[A] xor [B]",
        arguments: {
            "A": {
                type: Scratch.ArgumentType.BOOLEAN,
            },
            "B": {
                type: Scratch.ArgumentType.BOOLEAN,
            },
        },
        disableMonitor: true,
        isEdgeActivated: false
    });
    Extension.prototype["bo002"] = async (args, util) => {
        return Boolean(args["A"] ^ args["B"])
    };

    blocks.push({
        opcode: "f",
        blockType: Scratch.BlockType.BOOLEAN,
        text: "false",
        arguments: {},
        disableMonitor: true,
        isEdgeActivated: false
    });
    Extension.prototype["f"] = async (args, util) => {
        return false
    };

    blocks.push({
        opcode: "t",
        blockType: Scratch.BlockType.BOOLEAN,
        text: "true",
        arguments: {},
        disableMonitor: true,
        isEdgeActivated: false
    });
    Extension.prototype["t"] = async (args, util) => {
        return true
    };

    blocks.push({
        opcode: "rgb",
        blockType: Scratch.BlockType.REPORTER,
        text: "color with red: [R] green: [G] blue: [B]",
        arguments: {
            "R": {
                type: Scratch.ArgumentType.NUMBER,
                defaultValue: 0,
            },
            "G": {
                type: Scratch.ArgumentType.NUMBER,
                defaultValue: 0,
            },
            "B": {
                type: Scratch.ArgumentType.NUMBER,
                defaultValue: 0,
            },
        },
        disableMonitor: true,
        isEdgeActivated: false
    });
    Extension.prototype["rgb"] = async (args, util) => {
        return ((args["R"] * (256 * 256)) + ((args["G"] * 256) + args["B"]))
    };

    blocks.push({
        opcode: "ev001",
        blockType: Scratch.BlockType.EVENT,
        text: "when year is [Y]",
        arguments: {
            "Y": {
                type: Scratch.ArgumentType.NUMBER,
                defaultValue: 2027,
            },
        },
        disableMonitor: true,
        isEdgeActivated: false
    });
    Extension.prototype["ev001"] = async (args, util) => {
        if (Boolean(((new Date(Date.now()).getFullYear()) == args["Y"]))) {
            Scratch.vm.runtime.startHats(`${Extension.prototype.getInfo().id}_ev001`)
        };
    };

    blocks.push({
        opcode: "col",
        blockType: Scratch.BlockType.REPORTER,
        text: "color [COL]",
        arguments: {
            "COL": {
                type: Scratch.ArgumentType.COLOR,
            },
        },
        disableMonitor: true,
        isEdgeActivated: false
    });
    Extension.prototype["col"] = async (args, util) => {
        return args["COL"]
    };

    blocks.push({
        opcode: "time002",
        blockType: Scratch.BlockType.BOOLEAN,
        text: "current year is [Y] ?",
        arguments: {
            "Y": {
                type: Scratch.ArgumentType.NUMBER,
                defaultValue: 2026,
            },
        },
        disableMonitor: true,
        isEdgeActivated: false
    });
    Extension.prototype["time002"] = async (args, util) => {
        return ((new Date(Date.now()).getFullYear()) == args["Y"])
    };

    blocks.push({
        opcode: "re002",
        blockType: Scratch.BlockType.REPORTER,
        text: "if [BOOL] then [A] else [B]",
        arguments: {
            "BOOL": {
                type: Scratch.ArgumentType.BOOLEAN,
            },
            "A": {
                type: Scratch.ArgumentType.STRING,
                defaultValue: 'apple',
            },
            "B": {
                type: Scratch.ArgumentType.STRING,
                defaultValue: 'banana',
            },
        },
        disableMonitor: true,
        isEdgeActivated: false
    });
    Extension.prototype["re002"] = async (args, util) => {
        return (args["BOOL"] ? args["A"] : args["B"])
    };

    blocks.push({
        opcode: "re001",
        blockType: Scratch.BlockType.REPORTER,
        text: "if [BOOL] then [A]",
        arguments: {
            "BOOL": {
                type: Scratch.ArgumentType.BOOLEAN,
            },
            "A": {
                type: Scratch.ArgumentType.STRING,
                defaultValue: 'apple',
            },
        },
        disableMonitor: true,
        isEdgeActivated: false
    });
    Extension.prototype["re001"] = async (args, util) => {
        if (Boolean(args["BOOL"])) {
            return args["A"]
        };
    };

    blocks.push({
        opcode: "num",
        blockType: Scratch.BlockType.REPORTER,
        text: "number [N]",
        arguments: {
            "N": {
                type: Scratch.ArgumentType.NUMBER,
                defaultValue: 42,
            },
        },
        disableMonitor: true,
        isEdgeActivated: false
    });
    Extension.prototype["num"] = async (args, util) => {
        return Number(args["N"])
    };

    blocks.push({
        opcode: "cast001",
        blockType: Scratch.BlockType.REPORTER,
        text: "cast [BOOL] to reporter",
        arguments: {
            "BOOL": {
                type: Scratch.ArgumentType.BOOLEAN,
            },
        },
        disableMonitor: true,
        isEdgeActivated: false
    });
    Extension.prototype["cast001"] = async (args, util) => {
        return args["BOOL"]
    };

    blocks.push({
        opcode: "cast002",
        blockType: Scratch.BlockType.BOOLEAN,
        text: "cast [REPO] to boolean",
        arguments: {
            "REPO": {
                type: Scratch.ArgumentType.STRING,
            },
        },
        disableMonitor: true,
        isEdgeActivated: false
    });
    Extension.prototype["cast002"] = async (args, util) => {
        return args["BOOL"]
    };

    blocks.push({
        opcode: "time001",
        blockType: Scratch.BlockType.REPORTER,
        text: "years since [Y]",
        arguments: {
            "Y": {
                type: Scratch.ArgumentType.NUMBER,
                defaultValue: 2016,
            },
        },
        disableMonitor: true,
        isEdgeActivated: false
    });
    Extension.prototype["time001"] = async (args, util) => {
        variables['year'] = (new Date(Date.now()).getFullYear())
        variables['ya'] = 0
        while (!(variables['year'] == args["Y"])) {
            variables['year'] = (variables['year'] - 1)
            variables['ya'] = (variables['ya'] + 1)
        }
        return variables['ya']
    };

    blocks.push({
        opcode: "math001",
        blockType: Scratch.BlockType.REPORTER,
        text: "[A] ^ [B]",
        arguments: {
            "A": {
                type: Scratch.ArgumentType.NUMBER,
                defaultValue: 2,
            },
            "B": {
                type: Scratch.ArgumentType.NUMBER,
                defaultValue: 6,
            },
        },
        disableMonitor: true,
        isEdgeActivated: false
    });
    Extension.prototype["math001"] = async (args, util) => {
        return (args["A"] ** args["B"])
    };

    blocks.push({
        opcode: "str",
        blockType: Scratch.BlockType.REPORTER,
        text: "string [S]",
        arguments: {
            "S": {
                type: Scratch.ArgumentType.STRING,
                defaultValue: 'apple',
            },
        },
        disableMonitor: true,
        isEdgeActivated: false
    });
    Extension.prototype["str"] = async (args, util) => {
        return String(args["S"])
    };

    blocks.push({
        opcode: "time003",
        blockType: Scratch.BlockType.BOOLEAN,
        text: "is [Y] a leap year?",
        arguments: {
            "Y": {
                type: Scratch.ArgumentType.NUMBER,
                defaultValue: 2000,
            },
        },
        disableMonitor: true,
        isEdgeActivated: false
    });
    Extension.prototype["time003"] = async (args, util) => {
        return ((args["Y"] % 4) == 0)
    };

    blocks.push({
        opcode: "math002",
        blockType: Scratch.BlockType.BOOLEAN,
        text: "[N] is integer?",
        arguments: {
            "N": {
                type: Scratch.ArgumentType.NUMBER,
                defaultValue: 1,
            },
        },
        disableMonitor: true,
        isEdgeActivated: false
    });
    Extension.prototype["math002"] = async (args, util) => {
        return ((args["N"] % 1) == 0)
    };

    blocks.push({
        opcode: "colv001",
        blockType: Scratch.BlockType.REPORTER,
        text: "color (variable)",
        arguments: {},
        disableMonitor: true,
        isEdgeActivated: false
    });
    Extension.prototype["colv001"] = async (args, util) => {
        return variables['color']
    };

    blocks.push({
        opcode: "colb001",
        blockType: Scratch.BlockType.COMMAND,
        text: "set color to [COL]",
        arguments: {
            "COL": {
                type: Scratch.ArgumentType.COLOR,
            },
        },
        disableMonitor: true,
        isEdgeActivated: false
    });
    Extension.prototype["colb001"] = async (args, util) => {
        variables['color'] = args["COL"]
    };

    blocks.push({
        opcode: "ev002",
        blockType: Scratch.BlockType.EVENT,
        text: "when [BOOL]",
        arguments: {
            "BOOL": {
                type: Scratch.ArgumentType.BOOLEAN,
            },
        },
        disableMonitor: true,
        isEdgeActivated: false
    });
    Extension.prototype["ev002"] = async (args, util) => {
        if (Boolean(args["BOOL"])) {
            Scratch.vm.runtime.startHats(`${Extension.prototype.getInfo().id}_ev002`)
        };
    };

    blocks.push({
        opcode: "colbo001",
        blockType: Scratch.BlockType.BOOLEAN,
        text: "color [C1] matches color [C2] ?",
        arguments: {
            "C1": {
                type: Scratch.ArgumentType.COLOR,
            },
            "C2": {
                type: Scratch.ArgumentType.COLOR,
            },
        },
        disableMonitor: true,
        isEdgeActivated: false
    });
    Extension.prototype["colbo001"] = async (args, util) => {
        return (args["C1"] == args["C2"])
    };

    blocks.push({
        opcode: "math003",
        blockType: Scratch.BlockType.REPORTER,
        text: "- [N]",
        arguments: {
            "N": {
                type: Scratch.ArgumentType.NUMBER,
                defaultValue: 1,
            },
        },
        disableMonitor: true,
        isEdgeActivated: false
    });
    Extension.prototype["math003"] = async (args, util) => {
        return (0 - args["N"])
    };

    blocks.push({
        opcode: "text001",
        blockType: Scratch.BlockType.REPORTER,
        text: "reverse text [TEXT]",
        arguments: {
            "TEXT": {
                type: Scratch.ArgumentType.STRING,
                defaultValue: 'sananab',
            },
        },
        disableMonitor: true,
        isEdgeActivated: false
    });
    Extension.prototype["text001"] = async (args, util) => {
        variables['#'] = (args["TEXT"].length)
        variables['text'] = ''
        for (var ETeoBRQGPzkrLVBY = 0; ETeoBRQGPzkrLVBY < (args["TEXT"].length); ETeoBRQGPzkrLVBY++) {
            variables['text'] = (variables['text'] + (args["TEXT"].split("")[variables['#'] - 1]))
            variables['#'] = (variables['#'] - 1)
        }
        return variables['text']
    };

    Scratch.extensions.register(new Extension());
})(Scratch);