// Simple Vue-like template engine for the blog
function createSimpleApp(config) {
    return {
        mount: function(selector) {
            const element = document.querySelector(selector);
            if (!element) return;
            
            const data = config.data();
            const methods = config.methods || {};
            
            // Simple template replacement function
            function renderTemplate(element, data) {
                function interpolate(text) {
                    return text.replace(/\{\{\s*([^}]+)\s*\}\}/g, function(match, expr) {
                        try {
                            // Handle simple property access and method calls
                            expr = expr.trim();
                            if (expr === 'new Date().getFullYear()') {
                                return new Date().getFullYear();
                            } else if (expr.includes('(')) {
                                // Method call like formatDate(post.date)
                                const methodMatch = expr.match(/(\w+)\((.*?)\)/);
                                if (methodMatch && methods[methodMatch[1]]) {
                                    const args = methodMatch[2].split(',').map(arg => {
                                        arg = arg.trim();
                                        return evaluateExpression(arg, data);
                                    });
                                    return methods[methodMatch[1]].apply(null, args);
                                }
                            } else {
                                return evaluateExpression(expr, data);
                            }
                        } catch (e) {
                            return match; // Return original if evaluation fails
                        }
                    });
                }
                
                function evaluateExpression(expr, data) {
                    // Handle simple property access
                    if (expr === 'new Date().getFullYear()') {
                        return new Date().getFullYear();
                    }
                    
                    const parts = expr.split('.');
                    let value = data;
                    for (let part of parts) {
                        if (value && typeof value === 'object' && part in value) {
                            value = value[part];
                        } else {
                            return expr; // Return original if not found
                        }
                    }
                    return value;
                }
                
                // First, process simple interpolations (non-loop items)
                function processTextNodes(element) {
                    const walker = document.createTreeWalker(
                        element,
                        NodeFilter.SHOW_TEXT,
                        null,
                        false
                    );
                    
                    let textNode;
                    const textNodes = [];
                    while (textNode = walker.nextNode()) {
                        textNodes.push(textNode);
                    }
                    
                    textNodes.forEach(node => {
                        if (node.textContent.includes('{{')) {
                            node.textContent = interpolate(node.textContent);
                        }
                    });
                }
                
                // Process v-for directives by working with innerHTML
                const vForElements = element.querySelectorAll('[v-for]');
                vForElements.forEach(el => {
                    const vForValue = el.getAttribute('v-for');
                    
                    // Match patterns like "(post, index) in posts"
                    const match = vForValue.match(/\((\w+),\s*(\w+)\)\s+in\s+(\w+)/);
                    if (match) {
                        const [, itemVar, indexVar, arrayName] = match;
                        const array = data[arrayName];
                        
                        if (Array.isArray(array)) {
                            const parent = el.parentNode;
                            
                            // Get the innerHTML of the template element
                            let templateHTML = el.innerHTML;
                            
                            // Remove original element
                            el.remove();
                            
                            // Create elements for each item
                            array.forEach((item, index) => {
                                // Replace template variables in the HTML string
                                let itemHTML = templateHTML;
                                
                                // Replace all instances of post.property with actual values
                                Object.keys(item).forEach(prop => {
                                    const regex = new RegExp(`\\{\\{\\s*${itemVar}\\.${prop}\\s*\\}\\}`, 'g');
                                    const value = item[prop];
                                    itemHTML = itemHTML.replace(regex, value);
                                });
                                
                                // Replace method calls like {{ formatDate(post.date) }}
                                const dateRegex = new RegExp(`\\{\\{\\s*formatDate\\(${itemVar}\\.date\\)\\s*\\}\\}`, 'g');
                                if (methods.formatDate && item.date) {
                                    const formatted = methods.formatDate(item.date);
                                    itemHTML = itemHTML.replace(dateRegex, formatted);
                                }
                                
                                // Replace expressions like {{ post.readTime || '3' }}
                                const readTimeRegex = new RegExp(`\\{\\{\\s*${itemVar}\\.readTime\\s*\\|\\|\\s*'(\\d+)'\\s*\\}\\}`, 'g');
                                itemHTML = itemHTML.replace(readTimeRegex, (match, defaultValue) => {
                                    const value = item.readTime || defaultValue;
                                    return value;
                                });
                                
                                // Replace :href attributes
                                itemHTML = itemHTML.replace(/:href="([^"]*)"/g, (match, hrefValue) => {
                                    let newHref = hrefValue;
                                    // Replace expressions like '#post-' + post.id
                                    newHref = newHref.replace(new RegExp(`'#post-'\\s*\\+\\s*${itemVar}\\.id`), `#post-${item.id}`);
                                    newHref = newHref.replace(new RegExp(`'#category-'\\s*\\+\\s*${itemVar}\\.category`), `#category-${item.category}`);
                                    return `href="${newHref.replace(/'/g, '')}"`;
                                });
                                
                                // Handle v-if attributes (simplified)
                                itemHTML = itemHTML.replace(/v-if="[^"]*"/g, '');
                                
                                // Create a new element and set its innerHTML
                                const newDiv = document.createElement('div');
                                newDiv.className = el.className;
                                newDiv.innerHTML = itemHTML;
                                
                                parent.appendChild(newDiv);
                            });
                        }
                    }
                });
                
                // Process remaining simple interpolations
                processTextNodes(element);
            }
            
            if (config.mounted) {
                document.addEventListener('DOMContentLoaded', () => {
                    renderTemplate(element, data);
                    config.mounted();
                });
            } else {
                document.addEventListener('DOMContentLoaded', () => {
                    renderTemplate(element, data);
                });
            }
            
            // If DOM is already loaded
            if (document.readyState === 'loading') {
                // Wait for DOMContentLoaded
            } else {
                renderTemplate(element, data);
                if (config.mounted) config.mounted();
            }
        }
    };
}