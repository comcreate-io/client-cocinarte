export interface BlogPost {
  slug: string
  title: string
  metaTitle: string
  metaDescription: string
  heroImage: string
  date: string
  readTime: string
  category: string
  excerpt: string
  content: BlogSection[]
}

export interface BlogSection {
  type: 'paragraph' | 'heading2' | 'heading3' | 'list' | 'recipe' | 'tip-box' | 'cta'
  text?: string
  items?: string[]
  title?: string
  description?: string
  buttonText?: string
  buttonHref?: string
}

export const blogPosts: BlogPost[] = [
  {
    slug: 'cooking-with-toddlers',
    title: 'Cooking with Toddlers: Easy Tips, Recipes & Age-Appropriate Tasks',
    metaTitle: 'Cooking with Toddlers: Tips, Recipes & Age Tasks | CocinarTe PDX',
    metaDescription: 'Start cooking with your toddler today! Get age-appropriate kitchen tasks, 5 easy recipes, safety tips, and expert advice for kids ages 1-4.',
    heroImage: '/blogs/CocinarTe_Blog_1_Cooking_With_Toddlers.webp',
    date: 'March 20, 2026',
    readTime: '9 min read',
    category: 'Tips & Guides',
    excerpt: 'Your toddler already wants to help in the kitchen. That curiosity isn\'t a nuisance — it\'s an invitation. Get age-appropriate tasks, easy recipes, and safety tips for cooking with kids ages 1-4.',
    content: [
      {
        type: 'paragraph',
        text: 'Your toddler already wants to help in the kitchen. They\'re reaching for the spoon, grabbing at ingredients, and standing on tiptoe to see what\'s happening on the counter. That curiosity isn\'t a nuisance — it\'s an invitation.'
      },
      {
        type: 'paragraph',
        text: 'Cooking with toddlers builds fine motor skills, introduces math and science concepts, expands vocabulary, and creates the kind of bonding time that both of you will remember. It also makes adventurous eaters — children who help prepare food are far more likely to actually eat it.'
      },
      {
        type: 'paragraph',
        text: 'Yes, it will be messier than cooking alone. And slower. But with the right setup, realistic expectations, and a few age-appropriate tasks, cooking with your toddler can become one of the best parts of your week.'
      },
      {
        type: 'paragraph',
        text: 'At CocinarTe, we\'ve taught hundreds of young children to cook through our Chefcitos Together family classes in Hillsboro, Oregon. We\'ve seen toddlers as young as 3 crack eggs, roll dough, and proudly eat empanadas they made with their own hands. This guide shares what we\'ve learned about getting little ones involved in the kitchen safely and joyfully.'
      },
      {
        type: 'heading2',
        text: 'Why Cooking with Toddlers Is Worth the Mess'
      },
      {
        type: 'heading3',
        text: 'Developmental Benefits'
      },
      {
        type: 'paragraph',
        text: 'The kitchen is one of the richest learning environments in your home. When your toddler cooks, they\'re building skills across every developmental area without realizing it:'
      },
      {
        type: 'list',
        items: [
          'Fine motor skills — Stirring, pouring, tearing, squeezing, and mashing all strengthen the hand muscles needed for writing and drawing later',
          'Math concepts — Counting eggs, measuring cups, comparing "more" and "less," and observing how ingredients change quantity when combined',
          'Language development — Naming ingredients, learning action words (stir, pour, mix, squeeze), following step-by-step instructions, and describing textures and flavors',
          'Science basics — Watching butter melt, seeing batter transform into pancakes, observing how mixing changes colors and textures. The kitchen is a toddler\'s first science lab',
          'Sensory exploration — Feeling dough, smelling herbs, tasting new flavors. Cooking engages every sense in ways that screens and toys cannot'
        ]
      },
      {
        type: 'heading3',
        text: 'Life Skills and Confidence'
      },
      {
        type: 'paragraph',
        text: 'Beyond academics, cooking builds the kind of practical confidence that carries into everything else a child does:'
      },
      {
        type: 'list',
        items: [
          'Independence and self-reliance — "I can do it myself" is a toddler\'s favorite sentence, and the kitchen is one of the best places to let them prove it',
          'Healthier eating habits — Research consistently shows that children who participate in preparing food are more willing to try new ingredients. A toddler who mashes the avocado is far more likely to eat the guacamole',
          'Patience and sequencing — Following a recipe teaches that things happen in order, and that waiting is part of the process',
          'Self-esteem — There\'s nothing quite like a 2-year-old\'s pride when they announce to the family, "I made this!"'
        ]
      },
      {
        type: 'heading3',
        text: 'Cultural Connection'
      },
      {
        type: 'paragraph',
        text: 'Cooking is one of the most natural ways to share family heritage and cultural traditions with young children. Recipes carry stories — where your family comes from, what holidays taste like, what your grandmother made on Sunday mornings.'
      },
      {
        type: 'paragraph',
        text: 'Latin American cuisine is especially well-suited for cooking with toddlers. Many traditional recipes are deeply hands-on: rolling tortillas, mashing beans, assembling arepas, pressing empanada edges, squeezing limes. These aren\'t just meals — they\'re sensory experiences that connect children to culture through touch, smell, and taste.'
      },
      {
        type: 'heading2',
        text: 'Age-Appropriate Cooking Tasks for Toddlers'
      },
      {
        type: 'paragraph',
        text: 'The key to cooking with toddlers is matching the task to the child. Here\'s what most children can handle at each stage — though every child is different, so follow your toddler\'s lead.'
      },
      {
        type: 'heading3',
        text: 'Ages 18 Months to 2 Years'
      },
      {
        type: 'paragraph',
        text: 'At this age, keep tasks simple, sensory, and closely supervised. Your toddler is learning cause and effect — "I pour, it goes in the bowl" — and that\'s more than enough.'
      },
      {
        type: 'list',
        items: [
          'Tearing lettuce, herbs, or bread into pieces',
          'Stirring cold ingredients in a large bowl (use a heavy bowl that won\'t slide)',
          'Placing toppings on pizza, toast, or crackers',
          'Washing fruits and vegetables in a bowl of water',
          'Pouring pre-measured ingredients into a bowl',
          'Mashing soft foods with a fork (bananas, avocado, cooked sweet potato)',
          'Shaking a closed container to mix ingredients'
        ]
      },
      {
        type: 'paragraph',
        text: 'Can you cook with a 2-year-old? Absolutely. Just keep it to one or two tasks per session, and accept that most of the "cooking" is really exploring. That\'s exactly what it should be.'
      },
      {
        type: 'heading3',
        text: 'Ages 2 to 3 Years'
      },
      {
        type: 'paragraph',
        text: 'By 2, most toddlers have better hand coordination and longer attention spans. You can start introducing slightly more complex tasks:'
      },
      {
        type: 'list',
        items: [
          'Everything listed above, plus:',
          'Spreading soft ingredients with a butter knife or small spatula',
          'Rolling dough with a small rolling pin (tortillas, cookies, empanadas)',
          'Scooping and dumping ingredients with measuring cups',
          'Peeling bananas and oranges',
          'Shaking seasonings onto food',
          'Mixing batter with a spoon or small whisk',
          'Snapping green beans or asparagus',
          'Pressing cookie cutters into soft dough'
        ]
      },
      {
        type: 'paragraph',
        text: 'This is the age where "helping" starts to feel like actual participation. Let them do as much as they can — even when it\'s imperfect.'
      },
      {
        type: 'heading3',
        text: 'Ages 3 to 4 Years'
      },
      {
        type: 'paragraph',
        text: 'Three- and four-year-olds can handle real kitchen responsibilities with supervision. This is also the age when cooking starts to click as a multi-step activity rather than a single task.'
      },
      {
        type: 'list',
        items: [
          'Everything listed above, plus:',
          'Cutting soft foods with a kid-safe knife (bananas, strawberries, cooked vegetables)',
          'Kneading dough with both hands',
          'Cracking eggs into a bowl (this takes practice — and cleanup)',
          'Using cookie cutters and pressing dough edges',
          'Assembling simple recipes independently (wraps, sandwiches, fruit kabobs)',
          'Measuring ingredients with cups and spoons',
          'Juicing citrus fruits with a hand juicer',
          'Whisking eggs or light batters'
        ]
      },
      {
        type: 'paragraph',
        text: 'By age 3 or 4, your child can genuinely participate in making a full recipe from start to finish — with you guiding each step.'
      },
      {
        type: 'heading2',
        text: 'Kitchen Safety Rules for Cooking with Toddlers'
      },
      {
        type: 'paragraph',
        text: 'Cooking with a toddler requires more preparation than cooking alone, but the safety basics are straightforward:'
      },
      {
        type: 'list',
        items: [
          'Always supervise directly — Never leave a toddler alone in the kitchen, even for a moment. Stay within arm\'s reach during any task',
          'Keep hazards out of reach — Sharp knives, hot surfaces, heavy pots, and cleaning chemicals should be well out of the toddler\'s zone',
          'Use a sturdy step stool or learning tower — Your toddler needs to be at counter height to participate. Make sure whatever they stand on is stable and won\'t tip',
          'Teach "hot" and "sharp" early — These are two of the most important vocabulary words in the kitchen. Use them consistently and clearly',
          'Start with no-cook or cold recipes — Build confidence and routine before introducing any heat. Guacamole, fruit salad, and sandwich assembly are perfect first recipes',
          'Create a "toddler zone" — Set up their workspace away from the stove and oven. A section of counter or a low table works well',
          'Use kid-safe tools — Plastic knives, small whisks, silicone spatulas, and sturdy bowls make the experience safer and more manageable',
          'Hand-washing is step one and step last — Make it a non-negotiable ritual that bookends every cooking session'
        ]
      },
      {
        type: 'heading2',
        text: '5 Easy Recipes to Make with Your Toddler'
      },
      {
        type: 'paragraph',
        text: 'These recipes are tested, toddler-approved, and designed so your child does most of the work. Each one takes 15 minutes or less of active toddler time.'
      },
      {
        type: 'recipe',
        title: '1. Guacamole (No Cook)',
        description: 'Toddler tasks: Mashing avocado with a fork, squeezing lime with a hand press, stirring in ingredients, tasting as they go.\n\nWhy it works: It\'s entirely hands-on, requires zero heat, and toddlers love the mashing. Plus, they\'ll eat it because they made it — even the ones who "don\'t like green food."\n\nYou\'ll need: 2 ripe avocados, 1 lime, a pinch of salt, and optional add-ins (diced tomato, cilantro). Serve with tortilla chips.'
      },
      {
        type: 'recipe',
        title: '2. Fruit Salad with Lime and Honey',
        description: 'Toddler tasks: Tearing mint leaves, squeezing lime, stirring fruit together, tasting every other piece.\n\nWhy it works: It\'s colorful, refreshing, and the reward is instant. No waiting, no cooking — just assembling and eating.\n\nYou\'ll need: Whatever fruit you have (berries, mango, banana, grapes cut in halves), juice of 1 lime, a drizzle of honey, and a few mint leaves.'
      },
      {
        type: 'recipe',
        title: '3. Mini Quesadillas',
        description: 'Toddler tasks: Sprinkling shredded cheese on tortillas, placing toppings (beans, corn, diced peppers), folding the tortilla in half.\n\nParent handles: The stovetop, griddle, or quesadilla press.\n\nWhy it works: Quick, customizable, and universally loved. Let your toddler choose their own toppings and they\'ll eat every bite.'
      },
      {
        type: 'recipe',
        title: '4. Banana Pancakes (2 Ingredients)',
        description: 'Toddler tasks: Mashing banana, cracking an egg (with help), stirring batter, pouring batter from a measuring cup.\n\nParent handles: The griddle or pan.\n\nWhy it works: Only two ingredients (1 banana + 1 egg), so there\'s almost nothing to measure. Toddlers love watching batter turn into something they can eat — it\'s cause-and-effect magic.'
      },
      {
        type: 'recipe',
        title: '5. Empanada Dough Shapes',
        description: 'Toddler tasks: Rolling dough with a small rolling pin, pressing cookie cutters into dough, pinching edges closed, brushing with egg wash.\n\nParent handles: Baking (if you\'re making edible empanadas) or just let them play with the dough as-is.\n\nWhy it works: It\'s like play-dough, but edible. The sensory experience of kneading and shaping dough is deeply satisfying for toddlers. And if you bake them, the payoff is even sweeter.\n\nThis is also a beautiful way to introduce your child to Latin American food traditions. Empanadas are made across Central and South America — each country with its own fillings and shapes. Even a 2-year-old can start learning that food tells a story.'
      },
      {
        type: 'heading2',
        text: 'Tips for Making It Fun (Not Frustrating)'
      },
      {
        type: 'paragraph',
        text: 'The difference between a great cooking session and a stressful one usually comes down to parent expectations, not toddler behavior. Here\'s how to set yourself up for success:'
      },
      {
        type: 'list',
        items: [
          'Lower your expectations — The goal is the experience, not the result. A lopsided quesadilla your toddler made is better than a perfect one you made alone',
          'Give real tasks, not busy work — Toddlers know the difference. Stirring actual batter is engaging. Stirring an empty bowl is not',
          'Prep ingredients ahead of time — Measure, chop, and organize everything before your toddler joins. In professional kitchens, this is called mise en place. At home, it\'s called sanity',
          'Accept the mess — Put a splat mat or towel under the step stool. Dress your toddler in clothes you don\'t care about. The mess is part of the learning',
          'Choose your timing carefully — Cook when everyone is rested and reasonably fed. A hungry, tired toddler will not enjoy measuring flour. After a snack and a nap is the sweet spot',
          'Keep sessions short — 10 to 15 minutes is plenty for an 18-month-old. Even a 3-year-old may tap out after 20 minutes. Follow their lead',
          'Celebrate the result together — Sit down and eat what you made as a family. That shared moment is the whole point'
        ]
      },
      {
        type: 'heading2',
        text: 'Ready to Cook Together?'
      },
      {
        type: 'paragraph',
        text: 'Cooking with your toddler doesn\'t require professional equipment, gourmet recipes, or a picture-perfect kitchen. It requires a sturdy step stool, a little patience, and the willingness to let things get messy.'
      },
      {
        type: 'paragraph',
        text: 'Start small. Pick one recipe from this list. Let your toddler mash, pour, stir, and taste. Watch their face when they realize they made something real. That moment — that pride — is worth every grain of spilled flour.'
      },
      {
        type: 'paragraph',
        text: 'If you\'d love for your little one to explore the kitchen with expert guidance and other families, CocinarTe\'s Chefcitos Together classes are designed for exactly this. Parents and children ages 3 and up cook side by side, learning real recipes rooted in Latin American cuisine — empanadas, arepas, salsas, and more. Every class is hands-on, age-appropriate, and built around the joy of making food together.'
      },
      {
        type: 'cta',
        buttonText: 'Book a Chefcitos Together Class',
        buttonHref: '/#upcoming-classes'
      },
      {
        type: 'paragraph',
        text: 'Looking for a party your child will actually remember? CocinarTe also hosts cooking birthday parties for kids — check out our guide to the best kids birthday party ideas for more inspiration.'
      }
    ]
  },
  {
    slug: 'kids-birthday-party-ideas',
    title: 'Kids Birthday Party Ideas That Are Actually Fun (2026 Guide)',
    metaTitle: 'Kids Birthday Party Ideas That Are Actually Fun (2026) | CocinarTe',
    metaDescription: 'Looking for kids birthday party ideas beyond the bounce house? 10 creative, hands-on party themes for ages 3-12 that kids (and parents) will love.',
    heroImage: '/blogs/CocinarTe_Blog_2_Kids_Birthday_Party_Ideas.webp',
    date: 'March 22, 2026',
    readTime: '11 min read',
    category: 'Party Ideas',
    excerpt: 'The best kids birthday parties aren\'t about decorations or themes — they\'re about what the kids actually do. 10 creative, hands-on party ideas for ages 3-12.',
    content: [
      {
        type: 'paragraph',
        text: 'If you\'re reading this, you\'re probably staring down another birthday and trying to come up with something better than the same bounce house and sheet cake combo from last year. You want your child\'s party to be fun, memorable, and manageable — without spending your entire weekend inflating balloons and assembling goody bags.'
      },
      {
        type: 'paragraph',
        text: 'Here\'s the truth most party planning lists won\'t tell you: the best kids birthday parties aren\'t about decorations or themes. They\'re about what the kids actually do. A party where children are busy making, building, creating, or cooking will always beat a party where they\'re wandering around waiting for cake.'
      },
      {
        type: 'paragraph',
        text: 'This guide covers 10 creative, hands-on birthday party ideas for kids ages 3 through 12 — organized by what kids actually enjoy doing. We\'ve included options for every budget, from DIY-at-home setups to fully hosted experiences. And because we\'re CocinarTe, a kids cooking studio in Hillsboro, Oregon, we\'ll explain why cooking parties have quietly become one of the best-kept secrets in the birthday party world.'
      },
      {
        type: 'heading2',
        text: '10 Creative Kids Birthday Party Ideas'
      },
      {
        type: 'heading3',
        text: '1. Cooking Party (Ages 5-12) — Our Top Pick'
      },
      {
        type: 'paragraph',
        text: 'What it is: Kids cook real food as the main event. Not just decorating premade cupcakes — actually making a meal or a dish from scratch together.'
      },
      {
        type: 'paragraph',
        text: 'Why kids love it: They get to use real tools, work with real ingredients, and eat what they create. It feels grown-up, it\'s genuinely engaging, and even the shyest kid in the group participates because everyone has a task.'
      },
      {
        type: 'list',
        items: [
          'Make-your-own pizza with homemade dough',
          'Taco bar where kids prepare every component',
          'Empanada making (rolling dough, choosing fillings, pressing edges)',
          'Sushi rolling with kid-friendly fillings',
          'Decorate-your-own cupcakes with homemade frosting'
        ]
      },
      {
        type: 'tip-box',
        text: 'A hosted cooking class party takes all the stress off parents. The instructor handles the setup, the teaching, the cleanup, and the food. You just show up with the birthday child and a camera.'
      },
      {
        type: 'paragraph',
        text: 'CocinarTe offers cooking birthday parties where kids explore Latin American cuisine with hands-on guidance. Every child cooks, every child eats, and every child goes home talking about what they made.'
      },
      {
        type: 'heading3',
        text: '2. Art and Craft Party (Ages 4-10)'
      },
      {
        type: 'paragraph',
        text: 'A creative session where kids make something they keep — painting, tie-dye, pottery, jewelry, or slime.'
      },
      {
        type: 'list',
        items: [
          'Canvas painting with easels',
          'Tie-dye T-shirts (set up outside for easy cleanup)',
          'Air-dry clay sculptures',
          'Friendship bracelet station',
          'Slime bar with mix-ins (glitter, beads, scents)'
        ]
      },
      {
        type: 'paragraph',
        text: 'The creation doubles as the party favor — skip the goody bags entirely.'
      },
      {
        type: 'heading3',
        text: '3. Science Experiment Party (Ages 6-12)'
      },
      {
        type: 'paragraph',
        text: 'A series of kid-safe experiments that feel like magic but teach real science. Explosions, reactions, and things that fizz. Need we say more?'
      },
      {
        type: 'list',
        items: [
          'Baking soda and vinegar volcanoes',
          'Mentos and soda geysers (outdoor only)',
          'Crystal growing kits',
          'Bottle rocket launches',
          'Slime chemistry (also works as an art party crossover)'
        ]
      },
      {
        type: 'heading3',
        text: '4. Outdoor Adventure Party (Ages 5-12)'
      },
      {
        type: 'paragraph',
        text: 'An active, nature-based party that gets kids moving and exploring. Freedom, fresh air, and a break from structure.'
      },
      {
        type: 'list',
        items: [
          'Scavenger hunt with clues hidden around a park or backyard',
          'Obstacle course with timed races',
          'Backyard camping with s\'mores and flashlight tag',
          'Nature hike with a picnic at the top',
          'Water balloon battle (summer birthdays)'
        ]
      },
      {
        type: 'paragraph',
        text: 'This is one of the most budget-friendly options on the list. A park, some snacks, and a solid game plan is all you need.'
      },
      {
        type: 'heading3',
        text: '5. Dance and Music Party (Ages 3-10)'
      },
      {
        type: 'paragraph',
        text: 'A high-energy celebration built around music, movement, and rhythm. Kids are natural dancers — give them music and space and they will not stop moving.'
      },
      {
        type: 'list',
        items: [
          'Freeze dance competition',
          'Musical chairs tournament',
          'Karaoke with a microphone and speaker',
          'Dance-off with judges and silly prizes',
          'Latin dance party — teach basic salsa, cumbia, or merengue steps'
        ]
      },
      {
        type: 'heading3',
        text: '6. Movie Night Party (Ages 5-12)'
      },
      {
        type: 'paragraph',
        text: 'An indoor or outdoor cinema experience with all the fixings. It feels special — especially if you do it outdoors with a projector and blankets.'
      },
      {
        type: 'list',
        items: [
          'Outdoor movie night with a rented projector and screen',
          'Living room cinema with sleeping bags and pillows',
          'Popcorn bar with toppings (caramel, cheese, chocolate drizzle)',
          'Pajama theme — everyone arrives in PJs'
        ]
      },
      {
        type: 'heading3',
        text: '7. Sports and Games Party (Ages 5-12)'
      },
      {
        type: 'paragraph',
        text: 'Organized physical games and friendly competition. The competitive kids thrive, and even the less athletic ones have fun when the games are silly and inclusive.'
      },
      {
        type: 'list',
        items: [
          'Mini Olympics with events (relay race, long jump, bean bag toss)',
          'Soccer or kickball tournament',
          'Capture the flag',
          'Field day with ribbons or medals for every participant',
          'Water relay races (summer)'
        ]
      },
      {
        type: 'heading3',
        text: '8. Garden and Nature Party (Ages 4-10)'
      },
      {
        type: 'paragraph',
        text: 'A green-thumbed celebration where kids plant, explore, and connect with nature. Getting their hands in dirt is universally satisfying — and they go home with a living thing they grew.'
      },
      {
        type: 'list',
        items: [
          'Plant seeds in decorated pots (the pot is the party favor)',
          'Bug hunt with magnifying glasses and collection jars',
          'Flower pressing and nature journaling',
          'Garden-to-table activity — pick herbs from the garden and make a simple recipe together'
        ]
      },
      {
        type: 'heading3',
        text: '9. Build and Create Party (Ages 6-12)'
      },
      {
        type: 'paragraph',
        text: 'An engineering-focused party where kids construct, design, and problem-solve. There\'s something deeply satisfying about making something that stands up, rolls, or actually works.'
      },
      {
        type: 'list',
        items: [
          'LEGO building challenge with a theme and time limit',
          'Cardboard fort or castle construction (save boxes for weeks)',
          'Simple woodworking project (birdhouse kits with adult supervision)',
          'Marble run challenge with cardboard tubes and tape',
          'Paper airplane competition with distance and accuracy categories'
        ]
      },
      {
        type: 'heading3',
        text: '10. Cultural Exploration Party (Ages 5-12)'
      },
      {
        type: 'paragraph',
        text: 'Pick a country or region and explore its food, music, art, and traditions for an afternoon. It feels like traveling without leaving home.'
      },
      {
        type: 'list',
        items: [
          'Make empanadas with different fillings from different countries',
          'Dance to cumbia, salsa, or reggaeton',
          'Create papel picado (tissue paper banners) as decorations',
          'Play loteria (Latin American bingo)',
          'Learn a few words in Spanish through games'
        ]
      },
      {
        type: 'paragraph',
        text: 'CocinarTe specializes in Latin American cultural experiences — cooking, dance, music, and art — all in one party. It\'s a birthday with flavor, rhythm, and something your child has never done before.'
      },
      {
        type: 'heading2',
        text: 'How to Choose the Right Party Idea for Your Child'
      },
      {
        type: 'list',
        items: [
          'Start with your child\'s interests, not Pinterest trends — A kid who loves being in the kitchen will have more fun at a cooking party than at an elaborate themed event they didn\'t ask for',
          'Consider the age range of the guests — A party with 4-year-olds needs different activities than one with 10-year-olds. If the ages are mixed, choose something everyone can participate in at their own level (cooking and art work especially well for this)',
          'Factor in your budget and space — Some of the best parties on this list cost almost nothing. A park, a simple activity, and good food will always beat an expensive venue with mediocre entertainment',
          'Prioritize doing over watching — Kids remember what they did at a party, not what they watched. Hands-on activities beat hired entertainment almost every time',
          'Ask yourself: Will my child still talk about this party next month? That\'s the real test'
        ]
      },
      {
        type: 'heading2',
        text: 'Birthday Party Ideas by Age Group'
      },
      {
        type: 'heading3',
        text: 'Ages 3 to 5'
      },
      {
        type: 'paragraph',
        text: 'Keep it short — 1 to 1.5 hours maximum. At this age, attention spans are limited and overstimulation is real.'
      },
      {
        type: 'paragraph',
        text: 'Best bets: Art Party, Dance Party, Cooking Party (with parent helpers), Garden Party. Simple activities with immediate payoff. Skip the elaborate games with complex rules.'
      },
      {
        type: 'paragraph',
        text: 'For the youngest kids, a cooking party where parents participate alongside their children works beautifully. CocinarTe\'s family-style setup is designed for exactly this.'
      },
      {
        type: 'heading3',
        text: 'Ages 6 to 8'
      },
      {
        type: 'paragraph',
        text: 'This is the sweet spot for birthday parties. Kids can handle more complex activities, follow instructions, and sustain attention for longer.'
      },
      {
        type: 'paragraph',
        text: 'Best bets: Cooking Party, Science Party, Outdoor Adventure, Sports Party, Build Party. At this age, kids love competition, creation, and anything that feels like a challenge.'
      },
      {
        type: 'heading3',
        text: 'Ages 9 to 12'
      },
      {
        type: 'paragraph',
        text: 'Older kids want to feel mature. Skip the clown, skip the character appearance, and give them an experience instead.'
      },
      {
        type: 'paragraph',
        text: 'Best bets: Cooking Party, Build Party, Cultural Exploration, Movie Night. These kids want to do something cool that they can tell their friends about. A hands-on cooking class where they make real food hits that mark perfectly.'
      },
      {
        type: 'heading2',
        text: 'Budget-Friendly Birthday Party Tips'
      },
      {
        type: 'list',
        items: [
          'Host at a park instead of renting a venue — Parks are free, spacious, and kids can run off energy between activities',
          'DIY your decorations — Papel picado (tissue paper banners), balloon garlands, and hand-drawn signs cost next to nothing and look better than store-bought theme kits',
          'Choose one great activity instead of five mediocre ones — A single cooking project, art station, or scavenger hunt will hold attention longer than a rotation of half-baked activities',
          'Let the activity be the entertainment — At a cooking party, the food IS the activity AND the meal. No separate entertainment needed. No separate meal needed. That\'s a budget win',
          'Make the food part of the fun — A taco bar, a pizza-making station, or a decorate-your-own-cupcake setup is both the activity and the refreshments',
          'Limit the guest list — 6 to 8 kids will have significantly more fun than 20. Smaller groups mean more participation, less chaos, and lower costs',
          'Skip the goody bags — Let the activity\'s creation be the take-home. A painted canvas, a planted seed pot, or a container of empanadas they made is a better party favor than a bag of candy and plastic toys'
        ]
      },
      {
        type: 'heading2',
        text: 'Why Cooking Birthday Parties Are the Best-Kept Secret'
      },
      {
        type: 'list',
        items: [
          'Every kid is engaged the entire time — There are no bored children sitting on the sidelines. Everyone has a task, everyone is involved, and the activity scales naturally for different ages and skill levels',
          'The food is the activity and the meal — You don\'t need to buy separate entertainment and separate food. The cooking IS the entertainment, and what the kids make IS the meal',
          'Even picky eaters try new things — Something changes when a child makes food with their own hands. Kids who "don\'t like cheese" will eat the quesadilla they assembled',
          'Parents get to relax — At a hosted cooking party, an instructor runs the entire event. Setup, instruction, supervision, and cleanup are all handled',
          'Kids learn something real — At the end of the party, every child leaves knowing how to make a dish they\'d never tried before. That\'s a better memory than any goody bag'
        ]
      },
      {
        type: 'paragraph',
        text: 'At CocinarTe, our birthday party packages include everything — ingredients, kid-safe cooking tools, instruction, setup, and cleanup. Choose from cooking parties, art parties, or dance and music celebrations. Every package is built around hands-on participation and Latin American culture.'
      },
      {
        type: 'paragraph',
        text: 'Themes include empanada making, taco bars, salsa and guacamole stations, cupcake decorating, and seasonal specials. Parties are available for kids ages 5 and up at our Hillsboro studio, or we can bring the experience to your home or venue.'
      },
      {
        type: 'cta',
        buttonText: 'Book a Birthday Party',
        buttonHref: '/#birthday-parties'
      },
      {
        type: 'heading2',
        text: 'Make It a Party They\'ll Remember'
      },
      {
        type: 'paragraph',
        text: 'The best birthday parties are the ones where kids do something. Where they use their hands, make something real, and walk away with a story to tell. Whether that\'s building a cardboard castle, planting a seed, or rolling empanada dough for the first time — the magic is in the doing.'
      },
      {
        type: 'paragraph',
        text: 'If you\'re planning a birthday party in the Hillsboro or Portland metro area, CocinarTe offers cooking, art, and dance birthday experiences for kids that are hands-on, stress-free for parents, and unlike anything your child has done before.'
      },
      {
        type: 'paragraph',
        text: 'Because the best party favor is a skill they\'ll keep forever.'
      },
      {
        type: 'cta',
        buttonText: 'Explore Party Packages',
        buttonHref: '/#birthday-parties'
      }
    ]
  }
]

export function getBlogBySlug(slug: string): BlogPost | undefined {
  return blogPosts.find(post => post.slug === slug)
}

export function getAllBlogSlugs(): string[] {
  return blogPosts.map(post => post.slug)
}
