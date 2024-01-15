import * as esbuild from 'esbuild'
import * as fs from 'fs'


const args = process.argv.slice(2)
for (let i=0; i<args.length; i++) {
    console.log("arg[" + i + "]='" + args[i] + "'")
}
let outdir = 'out'
let outfile = undefined
let minifyOpt = 'development'

if (args.includes('--package')) {
    outdir = 'dist'
    outfile = 'dist/extension.js'
    minifyOpt = 'production'
} else if (args.includes('--watch')) {
    await runWatch()
    console.log("runWatch has resolved")
} else {
    runBuild().then(() => {
        console.info("build complete")
    }, (err) => {
        console.error("build failed! err=" + err)
        console.error("exiting with code 1")
        process.exit(1)
    })
}
console.log("esbuild execution has completed.  exiting...")
process.exit(0)


async function runBuild (config) {
    console.log("starting build...   args[0]=" + args[0])
    const result = esbuild.buildSync({
        entryPoints: [
            './src/extension.ts',
            './src/test/index.ts',
            './src/test/runTest.ts',
            './src/test/createTestConfig.ts'
        ],
        //// from tsconfig.json
        target: 'ES2019',

        //// common options
        outdir: outdir,
        outfile: outfile,
        platform: 'node',
        format: 'cjs',
        sourceRoot: '',
        sourcemap: true,

        //// not totally necessary
        // tsconfig: 'tsconfig.json',   // should be imported by default
        // write: true,                 // default
        allowOverwrite: true,           // my preference is to see the files compile
        logLevel: 'info',
        // metafile: './artifacts/esbuild_meta.json',
        metafile: true,
        minify: false,
        // minify: minifyOpt,
        // header / footer / legalComments

        //// watch only
        plugins: buildPlugin

        //// bundle only
        // bundle: args.includes('--package'),
        // minify: args.includes('--package'),
        // external: [
        //     'vscode'
        // ],
    })
    console.log("buildSync complete")

    if (args.includes('--verbose')) {
        console.log("verbose mode is activated!!")
        console.log("build result = " + JSON.stringify(result,null,2))
    }
    console.log("build complete!")
    console.log(" --       errors = " + result.errors.length)
    console.log(" --     warnings = " + result.warnings.length)
    // let outputFileCount = 0
    // for (const key of result.metafile.outputs.keys) {
    //     console.log("key=" = key)
    //     outputFileCount++
    // }
    // console.log(" -- output files = " + outputFileCount)
    console.log("\r\n**hint**: run 'npm run lint' next!")
}

async function runWatch () {

    const plugins = [{
        name: 'my-plugin',
        setup(build) {
            let count = 0
            build.onEnd(result => {
                if (count++ === 0) console.log('first build:', result)
                else console.log('subsequent build:', result)
            })
        },
    }]

    // Create a context for incremental builds
    const ctx = await esbuild.context({
        entryPoints: [
            './src/extension.ts',
            './src/test/index.ts',
            './src/test/runTest.ts',
            './src/test/createTestConfig.ts'
        ],
        //// from tsconfig.json
        target: 'ES2019',

        //// common options
        outdir: outdir,
        // outfile: outfile,
        platform: 'node',
        format: 'cjs',
        sourceRoot: 'src',
        // sourcemap: true,

        //// not totally necessary
        // tsconfig: 'tsconfig.json',   // should be imported by default
        // write: true,                 // default
        // allowOverwrite: true,           // my preference is to see the files compile
        logLevel: 'info',
        plugins: plugins,
        // metafile: './artifacts/esbuild_meta.json',
        // metafile: true,
        // minify: false,
        // minify: minifyOpt,
        // header / footer / legalComments

        //// watch only
    })

    // console.log("context.rebuild...")
    // const result = await context.rebuild()
    console.log("context.watch...")
    await ctx.watch()
    console.log("context.serve...")
    // await context.serve()
    console.log("watching stopped...")
    ctx.dispose()
}

async function runWatch_2 (config) {
    console.log("create watcj plugin")
    let buildPlugin = {
        name: 'bp',
        setup(build) {
            // const options = build.initialOptions
            // const watchFiles = options.entryPoints
            // const ts = require('esbuild')

            // build.onStart(() => {
            //     console.log("watch started")
            // })

            build.onResolve({ filter: /^.*$/ }, (args) => {
                console.log("onResolve: " + args.path)
                return ({
                    path: args.path,
                    namespace: 'bp-ts',
                    // watchConfig: {
                    //     paths: [ args.path ]
                    // }
                })
            })


            build.onLoad({ filter: /\.ts$/, namespace: 'bp-ts' }, (args) => {
                console.log("onLoad: " + args.path)
                return ({
                    contents: fs.readFileSync(args.path, 'utf8'),
                    loader: 'ts',
                })
            })

            bp.watch({}, {
                onRebuild(error, result) {
                    console.log("onRebuild: error=" + error + " result=" + result)
                }
            })

            // build.onLoad({ filter: /\.ts$/ }, async (args) => {
            //     const filePath = path.relative(process.cwd(), args.path);
            //     console.log('onLoad: ' + filePath)
            //     // const result = ts.rende({
            //     //   file: filePath,
            //     // });

            //     return {
            //         contents: filePath + ' error'
            //     }
            // })

            // build.onLoad({ filter: /^src\// }, args => {
            //     console.log("onLoad: " + args.path)
            //     return {
            //         watchDirs: [ 'src']
            //     }
            // })

            // build.onResolve({ filter: /^src\// }, async (args) => {
            //     console.log('onResolve: ' + args.path)
            //     // const result = build.resolve()
            //     if (result.errors.length > 0) {
            //         console.log("errors=" + result.errors.length)
            //         return {errors: result.errors}
            //     }
            //     return {
            //         path: result.path,
            //         contents: errors.length > 0 ? {errors: result.errors} : undefined
            //     }
            // })
        }
    }

    console.log('creating watch context')
    // const context =  esbuild.context({
    const watchConfig = {
        entryPoints: [
            './src/extension.ts',
            './src/test/index.ts',
            './src/test/runTest.ts',
            './src/test/createTestConfig.ts'
        ],
        //// from tsconfig.json
        target: 'ES2019',

        //// common options
        outdir: outdir,
        outfile: outfile,
        platform: 'node',
        format: 'cjs',
        sourceRoot: 'src',
        sourcemap: true,

        //// not totally necessary
        // tsconfig: 'tsconfig.json',   // should be imported by default
        // write: true,                 // default
        // allowOverwrite: true,           // my preference is to see the files compile
        // logLevel: 'info',
        // metafile: './artifacts/esbuild_meta.json',
        // metafile: true,
        // minify: false,
        // minify: minifyOpt,
        // header / footer / legalComments

        //// watch only
        plugins: [ buildPlugin ]

        //// bundle only
        // bundle: args.includes('--package'),
        // minify: args.includes('--package'),
        // external: [
        //     'vscode'
        // ],
    }

    console.log('watching files')
    await esbuild.build(watchConfig).then((result) => {
        console.log("watching files...  result=" + JSON.stringify(result,null,2))
    }, (err) => {
        console.error("watching files...  err=" + err)
    })

    // context.dispose()
    console.log("watching has stopped...")
}
