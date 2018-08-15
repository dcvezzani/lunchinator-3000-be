# lunchinator-3000-02

## Project setup
```
yarn install

NODE_ENV=development ./node_modules/.bin/knex migrate:latest
NODE_ENV=test ./node_modules/.bin/knex migrate:latest
```

### Compiles and hot-reloads for development
```
yarn debug
```

### Run unit tests
```
# fire up back-end instance in the 'test' environment
yarn debug-test

# run tests in a different window
yarn test
```

## Feature Walkthrough

Create a ballot
```
# request
curl http://localhost:3000/api/create-ballot -XPOST -H "Content-Type: application/json" --data '{ "endTime":"8/15/18 11:45", "voters":[ { "name":"Bob", "emailAddress": "bob@gmail.com" }, { "name":"Jim", "emailAddress": "jim@gmail.com" }, { "name":"Joy", "emailAddress": "joy@gmail.com" } ] }'

# response
{"ballotId":"80096f90-a050-11e8-b8b9-a1f85b016c68"}
```

Show choices and suggestion (ballot is active)
```
# request
curl "http://localhost:3000/api/ballot/80096f90-a050-11e8-b8b9-a1f85b016c68"

# response
{
  "choices": [
    {
      "id": 15,
      "name": "Cafe Zupas",
      "averageReview": "3",
      "description": "We make delicious soups, salads, sandwiches, & desserts. Each item is created by hand from chef-crafted recipes and quality-sourced ingredients in each of our kitchen"
    },
    {
      "id": 8,
      "name": "Firehouse Subs",
      "averageReview": "4",
      "description": "Serving a variety of hot gourmet sub sandwiches. Made with premium meats and cheeses, steamed hot and piled high on a toasted sub roll."
    },
    {
      "id": 17,
      "name": "In-n-Out Burger",
      "averageReview": "4",
      "description": "At In-N-Out Burger, quality is everything. That's why in a world where food is often over-processed, prepackaged and frozen, In-N-Out makes everything the old fashion way"
    },
    {
      "id": 2,
      "name": "Jimmy John's",
      "averageReview": "3",
      "description": "Jimmy John’s Gourmet Sandwiches – We Deliver"
    },
    {
      "id": 4,
      "name": "Chick-Fil-A",
      "averageReview": "2",
      "description": "Home of the original chicken sandwich with two pickles on a toasted butter bun since 1964. We also offer many healthy alternatives to typical fast food."
    }
  ],
  "suggestion": {
    "id": 8,
    "name": "Firehouse Subs",
    "averageReview": "4",
    "TopReviewer": "Ishmael",
    "Review": "mi fringilla mi lacinia mattis. Integer eu lacus. Quisque imperdiet, erat nonummy ultricies ornare, elit elit fermentum risus, at fringilla purus mauris a nunc. In at pede. Cras vulputate velit eu sem. Pellentesque ut ipsum ac mi eleifend egestas. Sed pharetra, felis eget varius ultrices, mauris ipsum porta elit, a feugiat tellus lorem eu metus. In lorem."
  }
}
```

Users included on the ballot vote (ballot is active)
```
# requests
curl "http://localhost:3000/api/vote?id=4&ballotId=80096f90-a050-11e8-b8b9-a1f85b016c68&voterName=Jim&emailAddress=jim@gmail.com" -XPOST 
curl "http://localhost:3000/api/vote?id=4&ballotId=80096f90-a050-11e8-b8b9-a1f85b016c68&voterName=Bob&emailAddress=bob@gmail.com" -XPOST 
curl "http://localhost:3000/api/vote?id=2&ballotId=80096f90-a050-11e8-b8b9-a1f85b016c68&voterName=Joy&emailAddress=joy@gmail.com" -XPOST 

# response
OK
```

Show ballot results (ballot is closed)
```
# request
curl "http://localhost:3000/api/ballot/80096f90-a050-11e8-b8b9-a1f85b016c68"

# response
{
  "winner": {
    "id": 4,
    "datetime": "8/15/18 06:06",
    "name": "Chick-Fil-A",
    "votes": 2
  },
  "choices": [
    {
      "id": 4,
      "name": "Chick-Fil-A",
      "votes": 2
    },
    {
      "id": 2,
      "name": "Jimmy John's",
      "votes": 1
    },
    {
      "id": 15,
      "name": "Cafe Zupas",
      "votes": 0
    },
    {
      "id": 8,
      "name": "Firehouse Subs",
      "votes": 0
    },
    {
      "id": 17,
      "name": "In-n-Out Burger",
      "votes": 0
    }
  ]
}

```

Attempts to vote after ballot is closed are rejected
```
# requests
curl "http://localhost:3000/api/vote?id=4&ballotId=80096f90-a050-11e8-b8b9-a1f85b016c68&voterName=Jim&emailAddress=jim@gmail.com" -XPOST 

# response
Conflict
```

