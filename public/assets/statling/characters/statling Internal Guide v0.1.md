# 📖 Statling Internal Guide v0.1

> Internal Design Guide
> Purpose: Create consistent production-quality Statling assets.

---

# 1. Brand Philosophy

## Core Concept

Statling is not a pet collection game.

Statling is a companion game where both the player and the pet grow together.

The player grows by playing mini-games.
The Statling grows by spending time with the player.

The relationship between player and Statling is the most important experience.

---

## Core Experience

Play

↓

Discover Yourself

↓

Statling is Born

↓

Take Care

↓

Grow Together

↓

Come Back Tomorrow

---

## Core Values

• Growth

• Companion

• Discovery

• Cozy

• Playful

• Warm

• Cute

• Personal

---

## Desired Emotion

Player should feel

Cute

↓

Attachment

↓

Responsibility

↓

Growth

↓

"My Statling."

Instead of

"I unlocked another pet."

---

# 2. Character Philosophy

A Statling is never "just a sprite."

Each Statling has:

• personality

• favorite food

• favorite activity

• favorite sleeping habit

• signature accessory

Every future design decision should reinforce this personality.

---

# 3. Character Consistency

Never modify

• species

• body ratio

• head size

• eye shape

• eye color

• eye highlights

• ear shape

• tail shape

• body color

• shading

• outline

• shadow

• accessories

• signature object

Only these may change

• eyelids

• eyebrows

• mouth

• blush

• pose

Expressions should never redesign the face.

---

# 4. Character Identity Rules

Each Statling owns a signature object.

Examples

Star Cat

↓

Star

Fish Cat

↓

Fish

Bee

↓

Honey

Wizard Owl

↓

Hat

The signature object is part of the character.

Never delete it.

Only move it naturally depending on the action.

---

# 5. Sprite Production Rules

Every sprite must use

• identical canvas

• identical scale

• identical baseline

• identical padding

• identical camera angle

• identical lighting

Nothing should be cropped.

---

# 6. Expression Rules

Priority

1. Eyelids

2. Eyebrows

3. Mouth

4. Body Pose

5. Blush

Do NOT redesign

• eyes

• pupils

• iris

• nose

• head

• face shape

---

# 7. State Design Rules

## Idle

Neutral pose.

---

## Blink

Exactly the same as idle.

Both eyes closed identically.

---

## Happy

Smile.

Body slightly happier.

Do not redesign eyes.

---

## Sad

Eyes remain identical.

Only mouth and eyelids change.

Small tears allowed.

---

## Angry

Eyebrows and mouth express anger.

Eyes stay identical.

---

## Surprised

Open mouth.

Wide expression.

No redesign of eyes.

---

## Eat

Food must match the character.

Examples

Bee

↓

Honey

Rabbit

↓

Carrot

Fish Cat

↓

Fish

Never generate random food.

---

## Wash

Use towel when appropriate.

Bubble amount should stay small.

Never cover the face.

Both eyes must be identical.

The signature object may

• stay beside the character

• be placed on the head

• be placed nearby

Never remove the object.

---

## Play

Use the signature object naturally.

---

## Pet

Only ONE human hand.

Never duplicate hands.

---

## Talk

Open mouth only.

No speech bubble.

No letters.

No symbols.

No text.

---

## Sleep

Comfortable sleeping pose.

Signature object may rest beside the character.

---

## Hungry

Visible drool.

One or two drops only.

Do NOT generate

• food icons

• speech bubbles

• thought bubbles

• floating symbols

---

## Dirty

Small dirt marks only.

Character must remain clean enough to recognize.

---

## Tired

Heavy eyelids.

Relaxed posture.

Never redesign eyes.

---

## Sick

Slight reddish nose.

Cold pack or thermometer allowed.

Do not exaggerate.

---

## Cry

Visible tears.

---

## Thinking

Looking slightly upward.

No thought bubble.

No icons.

No symbols.

---

## Love

Small hearts allowed.

Keep effects simple.

---

## Excited

Small sparkles allowed.

---

## Embarrassed

Blush.

Small shy expression.

---

## Gift

Happy expression.

Gift held naturally.

---

## Level-Up

Always place

ONE green upward arrow

at the

upper-right corner.

Same size.

Same position.

Same direction.

---

## Evolve

Looks more special.

Still the same character.

Never redesign into another animal.

---

# 8. Character Personality Notes

When creating a new Statling,
define the following before generating sprites.

• Personality

• Favorite food

• Favorite toy

• Favorite sleeping habit

• Signature accessory

• Wash interaction

• Play interaction

This prevents inconsistent future sprites.

---

# 9. Effect Rules

Allowed

❤️ Hearts

✨ Sparkles

🫧 Small bubbles

🎁 Gifts

⬆️ Level-Up Arrow

Effects should

• stay inside the canvas

• never cover the face

• never overlap nearby sprites

• remain simple

Avoid

• glow

• smoke

• huge particles

• excessive effects

---

# 10. Asset Rules

PNG

Transparent background

Centered

Consistent scale

Same naming convention

Folder example

pet_001/

idle.png

blink.png

happy.png

...

evolve.png

---

# 11. Forbidden Rules

Never generate

• duplicate hands

• duplicate legs

• duplicate tails

• detached limbs

• floating paws

• cropped ears

• cropped tails

• cropped accessories

• cropped shadows

• gray outlines

• semi-transparent outlines

• anti-aliased outlines

• speech bubbles

• thought bubbles

• English text

• Korean text

• numbers

• UI elements

• redesigning the character

• changing eye design

• changing body proportions

---

# 12. Production Priority

If every rule cannot be perfectly satisfied,
follow this priority.

Priority 1

Character identity

↓

Priority 2

Eye consistency

↓

Priority 3

Body proportions

↓

Priority 4

Outline quality

↓

Priority 5

Signature accessory

↓

Priority 6

Pose variation

---

# 13. QA Checklist

Before approving any sprite sheet

□ Character immediately recognizable

□ Eyes identical

□ Body ratio identical

□ Canvas identical

□ Baseline identical

□ Padding preserved

□ Outline #000000

□ White background (before transparency)

□ No duplicate limbs

□ No cropped ears

□ No cropped tails

□ No cropped accessories

□ No cropped shadow

□ No text

□ No speech bubbles

□ No thought bubbles

□ Wash uses identical eyes

□ Hungry includes drool only

□ Sick has subtle red nose

□ Level-Up arrow fixed at upper-right

□ Signature object preserved

---

# 14. Future Expansion

Planned future guides

□ Character Creation Guide

□ Room Design Guide

□ Furniture Guide

□ Animation Guide

□ Egg Guide

□ Accessory Guide

□ Audio Guide

□ UI Guide

□ Evolution Guide

This document is intended to evolve continuously throughout Statling development.
Whenever a new production issue is discovered, add a new rule rather than relying on memory.
