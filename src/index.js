const generate = require("@babel/generator").default; // For extracting condition code

const instrumentedLogs = new Set(); // Store instrumented logs globally
const instrumentedFunctions = new Set(); // Store instrumented functions globally

module.exports = function ({ types: t }) {
  return {
    visitor: {
      Program(path, state) {
        // ----------------------------------------------------------------------------
        // 1) Insert performance import
        // ----------------------------------------------------------------------------
        const performanceImport = t.importDeclaration(
          [
            t.importSpecifier(
              t.identifier("performance"),
              t.identifier("performance")
            )
          ],
          t.stringLiteral("perf_hooks")
        );
        path.unshiftContainer("body", performanceImport);

        // ----------------------------------------------------------------------------
        // 2) Insert global programUUID
        // ----------------------------------------------------------------------------
        const programUUID = t.variableDeclaration("const", [
          t.variableDeclarator(
            t.identifier("__programUUID__"),
            t.callExpression(t.identifier("__generateUniqueID"), [])
          )
        ]);
        path.unshiftContainer("body", programUUID);

        // ----------------------------------------------------------------------------
        // 3) Insert the global __generateUniqueID() function
        // ----------------------------------------------------------------------------
        const generateUUIDFunction = t.functionDeclaration(
          t.identifier("__generateUniqueID"),
          [],
          t.blockStatement([
            t.returnStatement(
              t.callExpression(
                t.memberExpression(
                  t.stringLiteral("xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx"),
                  t.identifier("replace")
                ),
                [
                  t.regExpLiteral("[xy]", "g"),
                  t.functionExpression(
                    t.identifier("__generateUniqueIDCallback"),
                    [t.identifier("c")],
                    t.blockStatement([
                      t.variableDeclaration("const", [
                        t.variableDeclarator(
                          t.identifier("r"),
                          t.binaryExpression(
                            "|",
                            t.binaryExpression(
                              "*",
                              t.callExpression(
                                t.memberExpression(t.identifier("Math"), t.identifier("random")),
                                []
                              ),
                              t.numericLiteral(16)
                            ),
                            t.numericLiteral(0)
                          )
                        )
                      ]),
                      t.variableDeclaration("const", [
                        t.variableDeclarator(
                          t.identifier("v"),
                          t.conditionalExpression(
                            t.binaryExpression("===", t.identifier("c"), t.stringLiteral("x")),
                            t.identifier("r"),
                            t.binaryExpression(
                              "|",
                              t.binaryExpression("&", t.identifier("r"), t.numericLiteral(0x3)),
                              t.numericLiteral(0x8)
                            )
                          )
                        )
                      ]),
                      t.returnStatement(
                        t.callExpression(
                          t.memberExpression(t.identifier("v"), t.identifier("toString")),
                          [t.numericLiteral(16)]
                        )
                      )
                    ])
                  )
                ]
              )
            )
          ])
        );
        path.unshiftContainer("body", generateUUIDFunction);

        // ----------------------------------------------------------------------------
        // 4) Insert contextManager detection logic
        //    ( Node => AsyncLocalStorage, Browser => Zone, fallback => global var )
        // ----------------------------------------------------------------------------

        // let __currentFunctionUUID__ = null;
        const currentFunctionUUIDDecl = t.variableDeclaration("let", [
          t.variableDeclarator(t.identifier("__currentFunctionUUID__"), t.nullLiteral())
        ]);

        // let contextManager = { run() {...}, getCurrentUUID() {...} }; // fallback
        const fallbackContextManager = t.variableDeclaration("let", [
          t.variableDeclarator(
            t.identifier("contextManager"),
            t.objectExpression([
              t.objectProperty(
                t.identifier("run"),
                t.functionExpression(
                  null,
                  [t.identifier("fn"), t.identifier("newUUID")],
                  t.blockStatement([
                    // const __previousUUID__ = __currentFunctionUUID__;
                    t.variableDeclaration("const", [
                      t.variableDeclarator(
                        t.identifier("__previousUUID__"),
                        t.identifier("__currentFunctionUUID__")
                      )
                    ]),
                    // __currentFunctionUUID__ = newUUID;
                    t.expressionStatement(
                      t.assignmentExpression(
                        "=",
                        t.identifier("__currentFunctionUUID__"),
                        t.identifier("newUUID")
                      )
                    ),
                    // try { return fn(); } finally { __currentFunctionUUID__ = __previousUUID__; }
                    t.tryStatement(
                      t.blockStatement([
                        t.returnStatement(
                          t.callExpression(t.identifier("fn"), [])
                        )
                      ]),
                      null,
                      t.blockStatement([
                        t.expressionStatement(
                          t.assignmentExpression(
                            "=",
                            t.identifier("__currentFunctionUUID__"),
                            t.identifier("__previousUUID__")
                          )
                        )
                      ])
                    )
                  ])
                )
              ),
              t.objectProperty(
                t.identifier("getCurrentUUID"),
                t.functionExpression(
                  null,
                  [],
                  t.blockStatement([
                    t.returnStatement(
                      t.logicalExpression(
                        "||",
                        t.identifier("__currentFunctionUUID__"),
                        t.nullLiteral()
                      )
                    )
                  ])
                )
              )
            ])
          )
        ]);

        // if (typeof process !== "undefined" && process.versions && process.versions.node) { ... } 
        const nodeCheck = t.ifStatement(
          t.logicalExpression(
            "&&",
            t.binaryExpression(
              "!==",
              t.unaryExpression("typeof", t.identifier("process")),
              t.stringLiteral("undefined")
            ),
            t.logicalExpression(
              "&&",
              t.memberExpression(
                t.memberExpression(t.identifier("process"), t.identifier("versions")),
                t.identifier("node"),
                false
              ),
              t.memberExpression(t.identifier("process"), t.identifier("versions"), false)
            )
          ),
          t.blockStatement([
            // const { AsyncLocalStorage } = require('async_hooks');
            t.variableDeclaration("const", [
              t.variableDeclarator(
                t.objectPattern([
                  t.objectProperty(
                    t.identifier("AsyncLocalStorage"),
                    t.identifier("AsyncLocalStorage"),
                    false,
                    true
                  )
                ]),
                t.callExpression(t.identifier("require"), [
                  t.stringLiteral("async_hooks")
                ])
              )
            ]),
            // const asyncUUIDStorage = new AsyncLocalStorage();
            t.variableDeclaration("const", [
              t.variableDeclarator(
                t.identifier("asyncUUIDStorage"),
                t.newExpression(t.identifier("AsyncLocalStorage"), [])
              )
            ]),
            // contextManager = { run(...) {...}, getCurrentUUID() {...} };
            t.expressionStatement(
              t.assignmentExpression(
                "=",
                t.identifier("contextManager"),
                t.objectExpression([
                  t.objectProperty(
                    t.identifier("run"),
                    t.functionExpression(
                      null,
                      [t.identifier("fn"), t.identifier("newUUID")],
                      t.blockStatement([
                        t.returnStatement(
                          t.callExpression(
                            t.memberExpression(
                              t.identifier("asyncUUIDStorage"),
                              t.identifier("run")
                            ),
                            [
                              t.objectExpression([
                                t.objectProperty(
                                  t.identifier("currentUUID"),
                                  t.identifier("newUUID")
                                )
                              ]),
                              t.identifier("fn")
                            ]
                          )
                        )
                      ])
                    )
                  ),
                  t.objectProperty(
                    t.identifier("getCurrentUUID"),
                    t.functionExpression(
                      null,
                      [],
                      t.blockStatement([
                        t.variableDeclaration("const", [
                          t.variableDeclarator(
                            t.identifier("store"),
                            t.callExpression(
                              t.memberExpression(
                                t.identifier("asyncUUIDStorage"),
                                t.identifier("getStore")
                              ),
                              []
                            )
                          )
                        ]),
                        t.returnStatement(
                          t.logicalExpression(
                            "||",
                            t.optionalMemberExpression(
                              t.identifier("store"),
                              t.identifier("currentUUID"),
                              false,
                              true
                            ),
                            t.nullLiteral()
                          )
                        )
                      ])
                    )
                  )
                ])
              )
            )
          ])
        );

        // else if (typeof Zone !== "undefined") { ... }
        const zoneCheck = t.ifStatement(
          t.binaryExpression(
            "!==",
            t.unaryExpression("typeof", t.identifier("Zone")),
            t.stringLiteral("undefined")
          ),
          t.blockStatement([
            t.expressionStatement(
              t.assignmentExpression(
                "=",
                t.identifier("contextManager"),
                t.objectExpression([
                  t.objectProperty(
                    t.identifier("run"),
                    t.functionExpression(
                      null,
                      [t.identifier("fn"), t.identifier("newUUID")],
                      t.blockStatement([
                        t.returnStatement(
                          t.callExpression(
                            t.memberExpression(
                              t.callExpression(
                                t.memberExpression(
                                  t.memberExpression(
                                    t.identifier("Zone"),
                                    t.identifier("current")
                                  ),
                                  t.identifier("fork")
                                ),
                                [
                                  t.objectExpression([
                                    t.objectProperty(
                                      t.identifier("name"),
                                      t.stringLiteral("functionZone")
                                    ),
                                    t.objectProperty(
                                      t.identifier("properties"),
                                      t.objectExpression([
                                        t.objectProperty(
                                          t.identifier("currentUUID"),
                                          t.identifier("newUUID")
                                        )
                                      ])
                                    )
                                  ])
                                ]
                              ),
                              t.identifier("run")
                            ),
                            [t.identifier("fn")]
                          )
                        )
                      ])
                    )
                  ),
                  t.objectProperty(
                    t.identifier("getCurrentUUID"),
                    t.functionExpression(
                      null,
                      [],
                      t.blockStatement([
                        t.returnStatement(
                          t.logicalExpression(
                            "||",
                            t.callExpression(
                              t.memberExpression(
                                t.memberExpression(
                                  t.identifier("Zone"),
                                  t.identifier("current")
                                ),
                                t.identifier("get")
                              ),
                              [t.stringLiteral("currentUUID")]
                            ),
                            t.nullLiteral()
                          )
                        )
                      ])
                    )
                  )
                ])
              )
            )
          ])
        );

        // Inject them all at top
        path.unshiftContainer("body", nodeCheck);
        path.unshiftContainer("body", zoneCheck);
        path.unshiftContainer("body", currentFunctionUUIDDecl);
        path.unshiftContainer("body", fallbackContextManager);


        // ----------------------------------------------------------------------------
        // 5) Traverse all functions to apply instrumentation
        // ----------------------------------------------------------------------------
        path.traverse({
          Function(pathF) {
            instrumentFunction(pathF, t, state);
          },
        });
      },
    },
  };
};

// ----------------------------------------------------------------------------
// Helpers for instrumentation
// ----------------------------------------------------------------------------

function isUserDefinedFunction(path) {
  if (!path.node.loc) {
    return false;
  }
  return true; // simplistic check
}

function getFunctionName(path) {
  let funcParent;
  if (path.isFunction()) {
    funcParent = path;
  } else {
    funcParent = path.getFunctionParent();
  }

  if (funcParent) {
    if (funcParent.node.id) {
      return funcParent.node.id.name;
    }
    let parentBinding = funcParent.findParent((p) => p.isVariableDeclarator());
    if (parentBinding && parentBinding.node.id) {
      return parentBinding.node.id.name;
    }
  }
  const stmt = funcParent.node;
  const lineNumber = stmt.loc ? stmt.loc.start.line : null;
  return `anonymous_function_${lineNumber}`;
}

function instrumentFunction(path, t, state) {
  if (!path.node.body || !path.node.body.body || !isUserDefinedFunction(path) || !state.file) return;

  const filename = state.file.opts.filename;
  const functionName = getFunctionName(path);
  const startLine = path.node.loc ? path.node.loc.start.line : -1;
  const endLine = path.node.loc ? path.node.loc.end.line : -1;

  // Avoid re-instrumenting special or already-instrumented functions
  if (
    functionName === "__generateUniqueID" ||
    functionName === "__generateUniqueIDCallback" ||
    instrumentedFunctions.has(functionName)
  ) {
    return;
  }
  instrumentedFunctions.add(functionName);

  let originalBody = path.node.body; // blockStatement

  // We'll detect console.log usage:
  let hasConsoleLog = false;
  path.traverse({
    ExpressionStatement(innerPath) {
      const stmt = innerPath.node;
      const lineNumber = stmt.loc ? stmt.loc.start.line : null;
      if (!lineNumber) return;

      if (
        t.isCallExpression(stmt.expression) &&
        t.isMemberExpression(stmt.expression.callee) &&
        stmt.expression.callee.object.name === "console" &&
        stmt.expression.callee.property.name === "log"
      ) {
        hasConsoleLog = true;
        
        const logStatement = createConsoleFetchLog(
          innerPath,
          t,
          "console.log",
          lineNumber,
          filename,
          stmt.expression.arguments,
          stmt.expression
        );
        // Insert log statement after the console.log call
        if (logStatement) {
          innerPath.insertAfter(logStatement);
        }
      }
    },
  });

  // If no console.log => skip instrumentation
  if (!hasConsoleLog) return;

  // -- If we do have console.log, wrap the body in contextManager.run(...)

  // Insert statement logs, if/branch logs, etc.
  // Wrap them in a try/finally with functionStart/functionEnd logs
  const functionStartLog = createFunctionLog(t, "functionStart", functionName, startLine, filename);
  const functionEndLog = createFunctionLog(t, "functionEnd", functionName, endLine, filename);

  // We'll keep your original approach of a try {} finally {}
  // So we gather the original body statements
  const originalBodyStatements = originalBody.body; // array of statements
  const tryBlock = t.blockStatement([functionStartLog, ...originalBodyStatements]);
  const finalBlock = t.blockStatement([functionEndLog]);
  const tryStatement = t.tryStatement(tryBlock, null, finalBlock);

  // Then we define a new "inner function" for contextManager.run
  const isAsync = !!path.node.async;
  const runFn = t.arrowFunctionExpression([], t.blockStatement([tryStatement]));
  runFn.async = isAsync;

  // parentUUID + currentUUID
  const parentUUIDDecl = t.variableDeclaration("const", [
    t.variableDeclarator(
      t.identifier("parentUUID"),
      t.callExpression(
        t.memberExpression(t.identifier("contextManager"), t.identifier("getCurrentUUID")),
        []
      )
    )
  ]);
  const currentUUIDDecl = t.variableDeclaration("const", [
    t.variableDeclarator(t.identifier("currentUUID"), t.callExpression(t.identifier("__generateUniqueID"), []))
  ]);

  // contextManager.run(runFn, currentUUID)
  const contextRunCall = t.callExpression(
    t.memberExpression(t.identifier("contextManager"), t.identifier("run")),
    [runFn, t.identifier("currentUUID")]
  );

  // Return it in the new function body
  const newBody = t.blockStatement([
    parentUUIDDecl,
    currentUUIDDecl,

    // Optionally, ensure we do statement/branch instrumentation inside the function body
    // We do that by a second pass:
    // instrument statements for logs
    // instrument if statements
    // (We can do it here or do .traverse after we build everything)
    // For now, let's use your existing approach:

    t.returnStatement(contextRunCall),
  ]);

  // Replace the function's body with our new block
  path.node.body = newBody;

  // Now do a second pass to insert statement logs, if logs, etc. inside the original body
  // => We'll call existing instrument steps but only if relevant
  // We'll do it on the "runFn" or we do it earlier. 
  // Actually, let's do it earlier on the original path. So let's call your existing logic:
  path.traverse({
    Statement(innerPath) {
      insertStatementLog(innerPath, functionName, t, filename);
    },
    IfStatement(ifPath) {
      instrumentIfStatement(ifPath, functionName, t, filename);
    },
  });
}

// ----------------------------------------------------------------------------
// create logs
// ----------------------------------------------------------------------------
function createFunctionLog(t, type, functionName, lineNumber, filename) {
  return t.expressionStatement(
    t.callExpression(t.identifier("fetch"), [
      t.stringLiteral("http://localhost:9678/logs"),
      t.objectExpression([
        t.objectProperty(t.identifier("method"), t.stringLiteral("POST")),
        t.objectProperty(
          t.identifier("headers"),
          t.objectExpression([
            t.objectProperty(t.identifier("Content-Type"), t.stringLiteral("application/json")),
          ])
        ),
        t.objectProperty(
          t.identifier("body"),
          t.callExpression(t.memberExpression(t.identifier("JSON"), t.identifier("stringify")), [
            t.objectExpression([
              t.objectProperty(t.identifier("type"), t.stringLiteral(type)),
              t.objectProperty(t.identifier("functionName"), t.stringLiteral(functionName)),
              t.objectProperty(t.identifier("lineNumber"), t.numericLiteral(lineNumber)),
              t.objectProperty(t.identifier("filename"), t.stringLiteral(filename)),
              // Add parentUUID + currentUUID if you want them here:
              t.objectProperty(
                t.identifier("currentUUID"),
                t.callExpression(
                  t.memberExpression(t.identifier("contextManager"), t.identifier("getCurrentUUID")),
                  []
                )
              ),              // We'll have "currentUUID" if we've declared it
              // but that might not exist if we're not inside the run block yet
              // so you can do a safe check or just assume it's declared
              t.objectProperty(t.identifier("parentUUID"), t.identifier("parentUUID")),
              createTimeStamp(t),
              createProgramUUIDProp(t),
            ]),
          ])
        ),
      ]),
    ])
  );
}

function insertStatementLog(innerPath, originalFunctionName, t, filename) {
  if (t.isScopable(innerPath.node) || t.isIfStatement(innerPath.node)) {
    return;
  }
  const lineNumber = innerPath.node.loc ? innerPath.node.loc.start.line : null;
  if (lineNumber === null) return;

  const functionName = getFunctionName(innerPath);
  if (functionName !== originalFunctionName) return;

  const logKey = `statement:${filename}:${innerPath.node.start}-${innerPath.node.end}`;
  if (instrumentedLogs.has(logKey)) return;
  instrumentedLogs.add(logKey);

  const logStatement = createFetchLog(t, "statement", functionName, lineNumber, filename);
  innerPath.insertBefore(logStatement);
}

function instrumentIfStatement(ifPath, originalFunctionName, t, filename) {
  const lineNumber = ifPath.node.loc ? ifPath.node.loc.start.line : null;
  const functionName = getFunctionName(ifPath);
  if (functionName !== originalFunctionName) return;
  if (lineNumber === null) return;
  const logKey = `ifStatement:${ifPath.node.start}-${ifPath.node.end}`;
  if (instrumentedLogs.has(logKey)) return;
  instrumentedLogs.add(logKey);

  const conditionCode = generate(ifPath.node.test).code;
  wrapBlock(ifPath.get("consequent"), t);
  const ifLog = createFetchLog(t, "branch", functionName, lineNumber, filename, "if-true", conditionCode);
  ifPath.get("consequent").unshiftContainer("body", ifLog);

  if (ifPath.node.alternate) {
    wrapBlock(ifPath.get("alternate"), t);
    const elseLog = createFetchLog(t, "branch", functionName, lineNumber, filename, "if-false", conditionCode);
    ifPath.get("alternate").unshiftContainer("body", elseLog);
  }
}

function wrapBlock(branchPath, t) {
  if (!branchPath.isBlockStatement()) {
    const original = branchPath.node;
    const block = t.blockStatement([original]);
    branchPath.replaceWith(block);
  }
}

function createFetchLog(t, type, functionName, lineNumber, filename, branchType = null, condition = null) {

  const baseFields = [
    t.objectProperty(t.identifier("type"), t.stringLiteral(type)), // "statement" or "branch"
    t.objectProperty(t.identifier("functionName"), t.stringLiteral(functionName)),
    t.objectProperty(t.identifier("lineNumber"), t.numericLiteral(lineNumber)),
    t.objectProperty(t.identifier("filename"), t.stringLiteral(filename)), // Include filename
    createTimeStamp(t),
    createProgramUUIDProp(t)
  ];

  if (branchType) {
    baseFields.push(t.objectProperty(t.identifier("branchType"), t.stringLiteral(branchType)));
  }
  if (condition) {
    baseFields.push(t.objectProperty(t.identifier("condition"), t.stringLiteral(condition)));
  }

  baseFields.push(
    t.objectProperty(
    t.identifier("currentUUID"),
    t.callExpression(
        t.memberExpression(t.identifier("contextManager"), t.identifier("getCurrentUUID")),
        []
    )),              
    t.objectProperty(t.identifier("parentUUID"), t.identifier("parentUUID")),
  );

  return t.expressionStatement(
    t.callExpression(t.identifier("fetch"), [
      t.stringLiteral("http://localhost:9678/logs"),
      t.objectExpression([
        t.objectProperty(t.identifier("method"), t.stringLiteral("POST")),
        t.objectProperty(
          t.identifier("headers"),
          t.objectExpression([
            t.objectProperty(t.identifier("Content-Type"), t.stringLiteral("application/json")),
          ])
        ),
        t.objectProperty(
          t.identifier("body"),
          t.callExpression(t.memberExpression(t.identifier("JSON"), t.identifier("stringify")), [
            t.objectExpression(baseFields),
          ])
        ),
      ]),
    ])
  );
}

function createConsoleFetchLog(innerPath, t, type, lineNumber, filename, logArgs, stmt) {
  const functionName = getFunctionName(innerPath);
  const logKey = `consolelog:${filename}:${stmt.start}-${stmt.end}`;
  const logText = innerPath.toString();
  if (instrumentedLogs.has(logKey)) return null;
  instrumentedLogs.add(logKey);

  return t.expressionStatement(
    t.callExpression(t.identifier("fetch"), [
      t.stringLiteral("http://localhost:9678/logs"),
      t.objectExpression([
        t.objectProperty(t.identifier("method"), t.stringLiteral("POST")),
        t.objectProperty(
          t.identifier("headers"),
          t.objectExpression([
            t.objectProperty(t.identifier("Content-Type"), t.stringLiteral("application/json")),
          ])
        ),
        t.objectProperty(
          t.identifier("body"),
          t.callExpression(t.memberExpression(t.identifier("JSON"), t.identifier("stringify")), [
            t.objectExpression([
              t.objectProperty(t.identifier("type"), t.stringLiteral(type)),
              t.objectProperty(t.identifier("functionName"), t.stringLiteral(functionName)),
              t.objectProperty(t.identifier("lineNumber"), t.numericLiteral(lineNumber)),
              t.objectProperty(t.identifier("logId"), t.callExpression(t.identifier("__generateUniqueID"), [])),
              t.objectProperty(t.identifier("logData"), t.arrayExpression([...logArgs])),
              t.objectProperty(t.identifier("filename"), t.stringLiteral(filename)),
              t.objectProperty(t.identifier("consoleLogText"), t.stringLiteral(logText)),
              createTimeStamp(t),
              createProgramUUIDProp(t),
              t.objectProperty(
                t.identifier("currentUUID"),
                t.callExpression(
                  t.memberExpression(t.identifier("contextManager"), t.identifier("getCurrentUUID")),
                  []
                )
              ), 
              t.objectProperty(t.identifier("parentUUID"), t.identifier("parentUUID")),
            ]),
          ])
        ),
      ]),
    ])
  );
}

function createTimeStamp(t) {
  return t.objectProperty(
    t.identifier("timestamp"),
    t.callExpression(t.memberExpression(t.identifier("performance"), t.identifier("now")), [])
  );
}

function createProgramUUIDProp(t) {
  return t.objectProperty(t.identifier("programUUID"), t.identifier("__programUUID__"));
}
