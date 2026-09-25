const fs = require('fs');
let content = fs.readFileSync('src/pages/Dashboard.jsx', 'utf8');

const replacement = '<div className="card p-6 border border-border shadow-sm hover:border-primary/50 transition-colors cursor-pointer" onClick={() => navigate(\'/ai-assistant\')}>\n' +
'          <div className="flex items-center gap-2 mb-2">\n' +
'            <Sparkles className="h-5 w-5 text-primary" />\n' +
'            <h3 className="font-semibold">AI Assistant</h3>\n' +
'          </div>\n' +
'          <p className="text-sm text-muted-foreground mt-2">Chat with your AI to analyze productivity trends</p>\n' +
'        </div>\n' +
'      </div>\n' +
'      \n' +
'      {/* Phase 9 Additions */}\n' +
'      <div className="grid md:grid-cols-2 gap-6 mt-6">\n' +
'        <div className="card p-6 border border-border shadow-sm cursor-pointer hover:border-primary/50 transition-colors" onClick={() => navigate(\'/goals\')}>\n' +
'          <div className="flex justify-between items-start mb-4">\n' +
'            <div className="flex items-center gap-2">\n' +
'              <Target className="h-5 w-5 text-primary" />\n' +
'              <h3 className="font-semibold text-lg">Active Goals</h3>\n' +
'            </div>\n' +
'            <span className="text-sm font-medium bg-primary/10 text-primary px-2 py-1 rounded-full">{activeGoals.length} Active</span>\n' +
'          </div>\n' +
'          {activeGoals.length > 0 ? (\n' +
'            <div className="space-y-3">\n' +
'              {activeGoals.slice(0, 2).map(goal => (\n' +
'                <div key={goal.id}>\n' +
'                  <div className="flex justify-between text-sm mb-1">\n' +
'                    <span className="font-medium">{goal.title}</span>\n' +
'                    <span>{Math.round(goal.progressPercentage)}%</span>\n' +
'                  </div>\n' +
'                  <div className="w-full bg-secondary rounded-full h-1.5">\n' +
'                    <div className="bg-primary h-1.5 rounded-full" style={{ width: ${Math.min(100, goal.progressPercentage)}% }}></div>\n' +
'                  </div>\n' +
'                </div>\n' +
'              ))}\n' +
'              {activeGoals.length > 2 && <p className="text-xs text-muted-foreground text-center pt-2">+{activeGoals.length - 2} more goals</p>}\n' +
'            </div>\n' +
'          ) : (\n' +
'            <p className="text-sm text-muted-foreground text-center py-2">No active goals set</p>\n' +
'          )}\n' +
'        </div>\n' +
'\n' +
'        <div className="card p-6 border border-border shadow-sm cursor-pointer hover:border-primary/50 transition-colors" onClick={() => navigate(\'/smart-plan\')}>\n' +
'          <div className="flex items-center gap-2 mb-4">\n' +
'            <Lightbulb className="h-5 w-5 text-amber-500" />\n' +
'            <h3 className="font-semibold text-lg">Smart Plan</h3>\n' +
'          </div>\n' +
'          {smartPlan ? (\n' +
'            <div className="flex justify-between items-center bg-muted/50 p-3 rounded-md">\n' +
'              <div>\n' +
'                <p className="text-sm font-medium">Today\'s Capacity: {smartPlan.planningCapacity} tasks</p>\n' +
'                <p className="text-xs text-muted-foreground mt-1">Planned: {smartPlan.plannedTaskCount} tasks</p>\n' +
'              </div>\n' +
'              <span className={	ext-xs font-semibold px-2 py-1 rounded-full }>\n' +
'                {smartPlan.workloadStatus}\n' +
'              </span>\n' +
'            </div>\n' +
'          ) : (\n' +
'            <p className="text-sm text-muted-foreground">Loading plan...</p>\n' +
'          )}\n' +
'        </div>\n' +
'      </div>';

content = content.replace(/<div className="card p-6 border border-border shadow-sm hover:border-primary\/50 transition-colors cursor-pointer" onClick=\{\(\) => navigate\('\/ai-assistant'\)\}>[\s\S]*?<\/div>\s*<\/div>/, replacement);
fs.writeFileSync('src/pages/Dashboard.jsx', content);
console.log("Updated Dashboard.jsx");
