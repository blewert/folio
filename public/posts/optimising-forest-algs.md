# Procedural Content Generation
One area which remains a fascinating research topic to me concerns algorithms for Procedural Content Generation (PCG). PCG largely focuses on the automatic and algorithmic generation of content, for games, media, and much more. For example, the procedural generation of 3D buildings would concern how 3D buildings can be automatically generated, as opposed to a manual design approach. PCG has a number of benefits, but the primary motivator for its use in games regards the lack of a manual design approach -- development times are reduced, a large amount of content can be generated in an instant, etc. Lots of examples can be found on the [/r/proceduralgeneration](https://www.reddit.com/r/proceduralgeneration/?rdt=38901) subreddit if you are interested in some more concrete examples.

A number of articles I have published throughout my career focus on novel procedural generation approaches. In fact, in my second year of my bachelor's degree, I started work on my first paper -- the procedural generation of virtual forests. Since then, it has remained an interesting topic to me.

## Procedural Forestry
Generating a virtual forest is actually quite easy. The easiest approach is to sample a bunch of random points in some closed space, and then distribute trees according to these sampled points. The sampling typically has $\mathcal{O}(1)$ time complexity enabling a cheap and fast way of generating forests. For example, consider the following C++. This is a simple pseudo-random number generator:

```cpp

//Properties for the RNG
std::random_device device;
std::mt19937 randomGenerator(device());

class Random
{
public:
    /// <summary>
    /// Returns a random float between {min} and {max}
    /// </summary>
    template <typename T> requires std::is_floating_point_v<T>
    static T Range(const T& min, const T& max)
    {
        //We have to do this because if the ranges aren't
        //ordered then C++ will throw an error
        float trueMin = std::min(min, max);
        float trueMax = std::max(max, min);

        //Build a uniform distribution
        std::uniform_real_distribution<T> udist(trueMin, trueMax);

        //Sample the distribution using the generator
        return (T)udist(randomGenerator);
    }

    /// <summary>
    /// Returns a random integer between {min} and {max}
    /// </summary>
    template <typename T> requires std::is_integral_v<T>
    static T Range(const T& min, const T& max)
    {
        return (T)Random::Range((float)min, (float)max);
    }
};
```

We can then use this to produce random coordinates:

```cpp

/// <summary>
/// Represents a 2-component vector (x, y)
/// </summary>
typedef struct Vector2
{
    float x;
    float y;
} Vector2;

/// <summary>
/// Generates a random point in the unit square
/// </summary>
Vector2 RandomPointInUnitSquare()
{
    return Vector2 
    { 
        Random::Range(0.0f, 1.0f),
        Random::Range(0.0f, 1.0f)
    };
}
```

We could use `RandomPointInUnitSquare()` to generate a number of pseudo-random points and then spawn trees at these sampled positions. This is perhaps the easiest and least-computational method of producing a virtual forest, with respect to the generative process. But does this produce nice, realistic looking forests?

We previous considered this in [our paper](https://www.mdpi.com/2073-431X/9/1/20), and we found that actually it really depends on the perspective you're viewing the forest from. If you're situated within the virtual forest, it doesn't really matter -- pseudo-random uniform distributions produce forests which look believable. However, if you're viewing the distribution from above, it does matter. We found that (amongst other things):

- Participants seem to like tightly-clustered distributions with equidistant spacing between tree instances. ($\chi^2 (2) = 10.25, p < 0.05$)
- Participants favoured medium density distributions, regardless of image perspective -- whether that be first-person ($\chi^2 (2) = 10.92, p < 0.05$), 2D aerial ($\chi^2 (2) = 40.92, p < 0.05$) or 3D aerial ($\chi^2 (2) = 15.75, p < 0.05$).
- Algorithms which are not pure pseudo-random distributions generally receive a higher degree of perceived believability when viewed from an aerial perspective. 

In our paper, we compared three algorithms: a pseudo-random uniform distribution, a bio-inspired plant competition model and a hybrid approach. We found that generally, the plant competition model produced more believable forestry from a top-down perspective. We found these results by conducting user studies with a large and diverse sample of participants $(n = 86)$. So problem solved right? Plant competition models are the best? Unfortunately not.

## Plant competition models and their problems
A plant competition model essentially involves the individual simulation of each tree in the forest. Plants can grow, spread their seed, age and die within the forest. There is also a simulated level of competition between plants for resources. We find this in nature; plants in close proximity compete for soil moisture and sunlight. Plants which are larger can occlude sunlight to smaller plants, limiting their growth and potentially killing them off. Plant competition models embody this principle: trees in a forest are individual simulated, and compete for resources with each other.

The issue with this is the complexity of simulating forests with software:

- Forests potentially have hundreds of thousands of trees in them. Individually simulating this many trees in real-time is a considerable task.
- For a given tree T, it has to look up potentially every other tree to find trees local to it. This yields a naive time complexity of $\mathcal{O}(n^2)$; which is *painfully* slow.

Plant competition models are slow, but that is fine for ecologists and those interested in simulating them for predicting forest growth. They can press "Simulate" and come back after a few hours; offline simulation is fine in this regard. But what if we want to simulate this in real-time? What if we want to simulate forest growth in real-time, to add to immersive virtual worlds? What if we wanted to simulate forest development in games, which are by their design, real-time applications?


It is with this motivation in mind that my latest paper, submitted to CGVC'24, covers an optimisation strategy in a popular games engine to make this process blisteringly fast. We make the process of simulating forestry possible for real-time applications, which is much needed for not only games, but in ecology research. Gone are the days of waiting hours for a result: we can do it on-the-fly!

![slow computer](https://i.giphy.com/M11UVCRrc0LUk.webp)

*(Above) Moss demonstrating the typical reaction to 4 hours of forest simulation, when suddenly the software dies 26 iterations before completion because it ran out of virtual memory. 💢*

# Optimisation strategy
In our recent paper, we looked at optimising an asymmetric plant competition model typically used in generating virtual forestry. Our optimisation strategy focused primarily on two things:

- The utilisation of an Entity-Component System (ECS), a data-oriented approach for vectorising computation and parallelising it easily.
- A uniform spatial hashing method, in tandem with the ECS.

We chose the popular Unity games engine to implement our approach as it has a fully-fledged ECS built into it, and offers native unmanaged containers (like `NativeParallelMultiMashMap<T, U>` for easy spatial hashing.

## Burstifying everything
Unity's ECS works well with Burst, and the Unity C# job scheduling system. Burst is a way of compiling C# down to native instructions, rather than Intermediary Language (IL) bytecode. Why? Put simple, native instructions are *quick*. IL bytecode in comparison requires a run-time or service which interpret the IL code down to native instructions for your particular platform. For example, if your C# code is:

```cs
int result = add(10, 15);
```

It's CIL (Common Intermediate Language) would be:

```cil

ldc.i4.10                       // Pushes 10 onto the stack as a 4 byte int (i4)
ldc.i4.15                       // Pushes 15 onto the stack as a 4 byte int (i4)

call int32 add(int32, int32)    // Calls the add function on the two args passed

stloc.0                         // Pop stack (result) into variable result 

```

Which could be compiled down to the following x86 instructions:

```asmatmel
add(int, int):
    push rbp                    ; Save where we need to pop back to on stack
    mov rbp, rsp                ; Set new base address for frame
    mov DWORD PTR [rbp-4], edi  ; Allocate 4 bytes of stack mem for arg1, move EDI into it
    mov DWORD PTR [rbp-8], esi  ; Do the same but for second arg, move ESI
    mov edx, DWORD PTR [rbp-4]  ; Move first arg into EDX
    mov eax, DWORD PTR [rbp-8]  ; Move second arg into EAX
    add eax, edx                ; Add EDX to EAX, EAX will contain result
    pop rbp                     ; Pop back to where we were on the stack
    ret                         ; Return: jumps back to where we were

mov esi, 15                     ; Load ESI with 15
mov edi, 10                     ; Load EDI with 10
call add(int, int)              ; Call add function
mov DWORD PTR[rbp-4], eax       ; Move result (in EAX) to new space in stack mem
```

Burst enables us to skip the IL step, meaning that an intermediary format is not used. Instead, native instructions are generated for the underlying C# code, which makes it blazingly fast. Burst is also very easy to use. You simply use attributes to mark constructs to be compiled down to native x86 with `[BurstCompile]`. For example, here is a C# job that we compile with Burst to cull trees who are marked as dead:

```cs
[BurstCompile]
public partial struct CullDeadTreesJob : IJobEntity
{
    public EntityCommandBuffer.ParallelWriter ecb;

    public void Execute([ChunkIndexInQuery] int chunkIndex, in TreeComponent tree, in Entity entity)
    {
        //This culls trees whose m_needsCull member is set to true
        if(tree.m_needsCull)
            ecb.DestroyEntity(chunkIndex, entity);
    }
}
```


## Jobifying everything
One crucial component of building efficient approaches with ECS is Unity's C# job system. Unity's C# job system (referred to herein as "the job system") enables computational tasks to be distributed amongst several threads for parallelisation. You must be thinking *"hmm Ben, that sounds an awful lot like a thread pool"* -- and you'd be right. The job system is similar to a thread pool in the sense that:

- Computation is distributed amongst a collection of *n* threads.
- Interaction with the system is abstracted away from the nitty-gritty: you simply *schedule* a job and it magically gets distributed, in the same way that a thread pool assigns worker threads.
- Computation can be parallelised, or optionally, serialised.
- Jobs are described with an `Execute()` method which is parallelised across many threads, similar to an indirect callback being passed via a thread pool execution request.

The job system does a good job (pun intended) of abstracting away from the details of how computation is distributed, whilst offering a friendly interface to programmers. When working with Unity's ECS, you can have several job types. Here are a few:

- `IJob`: The base interface for jobs, not specific to any ECS parallelisation.
- `IJobEntity`: The job is parallelised across all entities in the world, e.g. all 10,000 entities are distributed amongst *n* threads, each of which process a batch of entities via iteration.
- `IJobParallelFor`: A generalised job for performing the same operation for each element of a container (a parallelised `foreach`) or for a fixed number of iterations (a parallelised `for`).

In our approach we largely utilise `IJobEntity` as we perform most of our calculations on a per-entity basis. For example, aging trees requires iteration over all entities and adding one to their age variable. This can be achieved by using `IJobEntity`.

![pc on fire](https://media2.giphy.com/media/CZZFrvvfdaYcsOyyh0/giphy.webp?cid=dda24d502wjxy5goifkxd8jkhvjtyg4zm12fmemlqched3it&ep=v1_internal_gif_by_id&rid=giphy.webp&ct=g)

*(Above) A visual depiction of burst-compiled ECS code running in parallel, thanks to the job system.*

## Job structure
We have several jobs which enables the super fast simulation of virtual forestry by leveraging the ECS and spatial hashing. Although jobs are parallelised, their order and execution is synchronised carefully to ensure the correct functioning of our approach. For example, the spatial hashing job runs before most of the jobs which simulate individual trees. If this order was negated, things would go drastically wrong. 

These are the steps we took, and the order in which they are executed for each iteration of the overarching `ISystem` instance:

- **On the first step of the simulation**: A `SpawnTreesJob` instance is initialised and executed in parallel. This job spawns an initial number of trees randomly into the environment, for further simulation. This is because forestry simulation algorithms are predicated on the existence of trees initially in the world.
- **Build entity queries & frame Entity-Command Buffer (ECB)**: Before any jobs are run, we build queries for calculating what tree entities are in the world. We also create an ECB to perform parallelised structural changes (such as adding/removing trees) at a later point. Here we also create the frame's `NativeParallelMultiHashMap<int, int>` which will be used in spatial hashing.
- **AssignIndexToTreeJob**: Tree entities are iterated over via an `IJobEntity` job and assigned a spatial hash according to a uniform grid. Details on this later.
- **CullDeadTreesJob**: Tree entities are iterated over in a similar fashion. The job removes dead trees if they were flagged as dead in the last frame.
- **UpdateTreesJob**: Each tree is aged, and flagged for removal if their age > a certain value. 
- **SpawnTreesJob**: Each tree in the simulation is considered for propogating new trees if their age > a certain value. If this condition is met, a random chance $p$ is considered as $c < t$. If true, the tree creates a new tree entity randomly around its position.
- **FONCompetitionJob**: For each entity, uses the hashmap for neighbourhood lookups to see what trees are nearby this one. From this it then determines plant competition, thereby removing younger plants occluded from canopy cover.

## Spatial hashing
We also leverage spatial hashing, which is an obvious choice for optimising any type of agent-oriented simulation. Spatial hashing reduces the number of entities considered when calculating some metric. A classic application of this is in the boids algorithm to simulate flocking behaviour. As part of this algorithm, every entity in a boids algorithm has to look at the average heading of other entities in its neighbourhood. For this, it potentially needs to look at every other entity in the simulation. This grows exponentially as more and more agents are considered, with a time complexity of $\mathcal{O}(n^2)$.

We can reduce this though, by only considering entities which are *approximate* to the entity in consideration. One way of doing this is cutting the world up into grid cells, and assigning each entity an cell index. They can then use this cell index to look up which other entities are in the same cell. This can be done with $\mathcal{O}(1)$ access time with a hashmap, with the hash being the assigned grid cell. This method of quantising a space into grid cells of the same size is known as *uniform* spatial hashing, as subdivision results in grid cells of a uniform length. 

We hash an entity's position $\mathbf{p} \in \mathbb{R}^2$ (trees are simulated on the $xy$ plane) by firstly computing the grid delta value $\mathbf{g}$ as $\mathbf{g} = \mathbf{w} / n$ where $\mathbf{w}$ is a 2D vector containing the world boundaries. For example, you may have the vector $\mathbf{w} = \left[ 100, 100 \right]^T$ which defines a world size of $100 \times 100$ in-game units. Here $n$ is the number of subdivisions of the uniform grid. For example, in this case, $\mathbf{w} / n$ when $n = 20$ would result in the vector $\mathbf{g} = \left[ 5, 5 \right]^T$ defining the uniform cell size as $5 \times 5$ in-game units.

Then, using the tree's position $\mathbf{p}$, it can be hashed with a function $I(\mathbf{p})$ giving us the 2D spatial index (hence $I$) for this particular tree. This can be seen below: 


$$
I(\mathbf{p}) = \begin{pmatrix} 
    \left\lfloor \frac{\mathbf{p}_x}{\mathbf{g}_x} \right\rfloor & 
    \left\lfloor \frac{\mathbf{p}_y}{\mathbf{g}_y} \right\rfloor
    \end{pmatrix}
$$

We finally hash the 2D index $I(\mathbf{p})$ of the position $\mathbf{p}$ to a 1D hashed index $\mathcal{H}(\mathbf{p})$ (hence $\mathcal{H}$) as:

$$
    \mathcal{H}(\mathbf{p}) = I(\mathbf{p})_x + n \cdot I(\mathbf{p})_y
$$

Where $n$ is the number of grid subdivisions, as discussed earlier. 

### The code
We assign spatial indices every frame, before any jobs run. Future work could perhaps look at optimising this further, as the task of generating a new spatial map every frame can be expensive. The 1D index, $\mathcal{H}(\mathbf{p})$ of a tree's position $\mathbf{p}$ is assigned to the `TreeComponent` attached to each tree entity. This can then be used later to access its local neighbourhood.

The assigning of spatial indexing is done in a separate job prior to the simulation of an individual tree. The `AssignIndexToTreeJob` job can be seen below.

```cs

[BurstCompile]
public partial struct AssignIndexToTreeJob : IJobEntity
{
    public NativeParallelMultiHashMap<int, TreeComponent>.ParallelWriter parallelHashMap;
    public ForestComponent forest;

    public void Execute([EntityIndexInQuery] int entityIndex, ref TreeComponent tree)
    {
        //Not in this forest? Get out of here
        if (tree.m_forestIndex != forest.m_forestIndex)
            return;

        var hash = forest.m_spatialHasher.Hash(tree.m_position);
        tree.m_hash = hash;
        parallelHashMap.Add(hash, tree);
    }
}
```

There are a few things to note here regarding our approach:

1) Each forest (which contains many trees) has its own spatial hasher instance, i.e. `forest.m_spatialHasher`.
2) The spatial hasher has a `Hash(float3)` method which returns a `int`, which is assigned to the individual tree with `tree.m_hash = hash`.
3) We use Unity's `NativeParallelMultiHashMap<T, U>` where `T = int` and `U = TreeComponent` to index with an `int` and get out an array of `TreeComponent` instances.
    1) Notice that this is a `NativeParallelMultiHashMap` and not a `NativeParallelHashMap`. The `Multi` version returns an array of everything for a given index, which allows for $\mathcal{O}(1)$ access time. 

The spatial hasher instance (`forest.m_spatialHasher`) is a bespoke class with one purpose: to hash `float2` positions to `int` hashes. The code for this can be seen [here](https://github.com/StaffsUniGames/pcg-forests-ecs/blob/main/Assets/ecs/common/SpatialHasher.cs); it largely embodies the process of calculating $\mathbf{g} = \mathbf{w}/n$, $I(\mathbf{p})$ and $\mathcal{H}(\mathbf{p})$.

## Simulation details
Each tree is simulated individually in our approach. There are a number of steps which are used in the updating of each tree. We largely take inspiration from asymmetric plant competition models (discussed in the paper), which focus on interplant competition for resources. For example, if one plant grows in proximity to another and it is larger, it will kill the younger plant. This provides a model similar to real-life -- where larger plants with larger canopy cover occlude younger plants from the sun, resulting in the death of the younger plant. 

We break down the competition into three parts: culling, spawning and competition. There is another step too to spawn an initial amount of trees into the simulation.

In culling, a separate job `CullDeadTreesJob` simply iterates over each tree entity and checks if it is dead. Each tree component has a `bool` member `m_needsCull` which is set to true if the tree dies. If it is true, the `CullDeadTreesJob` actually removes the entity from the simulation by writing to the ECB (Entity Command Buffer). The reason this is done in a separate job is because providing structural changes within ECS is not good: you're always trying to fight doing so. So, if we can play back structural changes at a well-defined point (e.g. removing all entities at a single point in time), then we can help reduce any weird race conditions. Remember, this code is parallelised; many threads are running versions of it all at the same time.

Secondly, the `SpawnTreesJob` does a few things:

- It ages the tree by calling `tree.m_age++`. 
- It flags the tree for culling by `CullDeadTreesJob` if `tree.m_age > tree.m_deathAge`. This represents the natural death of trees by simply dying of old age.
- Spawns sapling trees local to the tree in consideration, if `tree.m_age >= tree.m_matureAge`.

For each iteration where a tree's age $a$, new sapling trees are added near the tree if $a > m$ where $m$ is the "mature" age of the tree and a random probability $p$ is satisfied (see earlier). The position of a new tree $\mathbf{p'}$ from the tree's position $\mathbf{p}$ is selected randomly as:

$$
\mathbf{p'} = \mathbf{p} + \mathbf{\hat{w}} \cdot d_s
$$

Where $\mathbf{\hat{w}}$ is the uniform wind vector of the simulation and $d_s$ is the randomised forest-wide spread distance for new plants. The job also wraps trees around the world boundaries if $\mathbf{p}'$ exceeds it. The bulk of this job can be seen below.

```cs

public void Execute([ChunkIndexInQuery] int chunkIndex, ref TreeComponent tree, in Entity entity)
{
    //Omitted a few lines [...]

    //TreeComponent modifiedTree = tree;
    tree.m_age++;

    //Set to needing cull
    if (tree.m_age > tree.m_deathAge)
        tree.m_needsCull = true;

    //Check if mature or not
    if (tree.m_age < tree.m_matureAge)
        return;

    float randChance = forest.m_rng.NextFloat(forest.m_spreadChance.min, forest.m_spreadChance.max);

    if (forest.m_rng.NextFloat() > randChance)
        return;

    //----

    //Omitted a few lines [...]

    //Use NextFloat because NextFloat2 doesn't do what you'd expect
    float a = forest.m_windDirection;
    float d = forest.m_rng.NextFloat(forest.m_spreadDistance.min, forest.m_spreadDistance.max);

    float randX = tree.m_position.x + math.sin(a) * d;
    float randY = tree.m_position.y + math.cos(a) * d;

    //Wrap around if x/y limits exceeded
    if (randX > forest.m_cullRegionX.max) randX %= forest.m_cullRegionX.max;
    if (randY > forest.m_cullRegionY.max) randY %= forest.m_cullRegionY.max;
    //--
    if (randX < forest.m_cullRegionX.min) randX = forest.m_cullRegionX.max - math.abs(randX);
    if (randY < forest.m_cullRegionY.min) randY = forest.m_cullRegionY.max - math.abs(randY);

    //No swizzling, they are spawned on XY plane
    float3 randPos3 = new float3(randX, randY, 0);
    float2 randPos2 = new float2(randX, randY);

    //Instantiate the new tree
    Entity newEntity = ecb.Instantiate(chunkIndex, randomPrefab);

    //Build local transform
    float scale = 1;

    //Scale needs randomising?
    if (forest.m_randomiseScale)
        scale = forest.m_rng.NextFloat(0.85f, 1.0f);

    if (forest.m_alignTreesAlongXZ)
        randPos3 = new float3(randPos3.x, 0, randPos3.y);

    //Build T*R*S from what we have so far
    LocalTransform trans = LocalTransform.FromPositionRotationScale(randPos3, quaternion.identity, scale);

    //Omitted a few lines [...]

    //Set the position of the entity
    ecb.SetComponent(chunkIndex, newEntity, trans);

    //Add a tree component: make this entity a tree
    ecb.AddComponent(chunkIndex, newEntity, new TreeComponent
    {
        m_age = 0,
        m_deathAge = forest.m_rng.NextUInt(forest.m_deathAge.min, forest.m_deathAge.max),
        m_matureAge = forest.m_rng.NextUInt(forest.m_matureAge.min, forest.m_matureAge.max),
        m_position = randPos2,
        m_needsCull = false,
        m_forestIndex = forest.m_forestIndex,
    });
}
```

Plant competition is implemented via a FON-based approach, which represents a tree's age with its degree of influence with other plants. Basically, trees are represented as circles, called their Field-of-Neighbourhood (FON). The FON grows with age, e.g. older plants have a larger FON. If two FONs overlap, the two trees are considered to be competing for the same resources. The larger, older plant dominates the younger plant, resulting its eventual death.

We embody this principle via the `FONCompetitionJob`. The job runs per tree entity, and looks up other trees within the same grid cell, using the hashmap discussed earlier. This is done quite easily with:

```cs

//Get all other entities in this cell
var entities = hashMap.GetValuesForKey(tree.m_hash);
```

The process can be seen below.

```cs

//Get all other entities in this cell
var entities = hashMap.GetValuesForKey(tree.m_hash);

foreach(var other in entities)
{
    //What's the distance to the other tree?
    var dist = math.distance(other.m_position, tree.m_position);

    //They're the same
    if (dist <= math.EPSILON)
        continue;

    //Get percent of life and calculate fon from this
    float lifeP = tree.m_age / (float)forest.m_deathAge.max;
    float fon = math.max(lifeP * MAX_TREE_RADII, MIN_TREE_RADII);

    //Not in competition? skip
    if (math.distance(other.m_position, tree.m_position) > fon)
        continue;

    //Cull if needed
    if (tree.m_age > other.m_age)
        tree.m_needsCull = true;
}
```

You can take a look at the job [here](https://github.com/StaffsUniGames/pcg-forests-ecs/blob/main/Assets/ecs/systems/ForestUpdateSystem.cs), namely line 96 onwards. The line above finds all entities local to the tree, by indexing into the hashmap with the tree's hashed 1D index. This results in an array of entities which can be iterated over.

The loop then does a few things:

- Checks if the iterated entity is this tree, and if so, ignore it.
- Calculates if the FON of the other tree overlaps this tree's position $\mathbf{p}$.
- If this is the case, compare the age of the two plants -- the younger one should be removed from the simulation.

Finally, a separate job named `SpawnInitialTreesJob` runs once before the simulation starts, and seeds the forest with some trees at uniform randomly sampled positions. This is because plant competitions are hinged on the existence of trees initially. It does this with a simple for loop:

```cs

public void Execute([ChunkIndexInQuery] int chunkIndex, ref ForestComponent forest, in Entity entity)
{
    DynamicBuffer<TreePrefabItem> prefabBuf = prefabLookup[entity];

    for (int i = 0; i < forest.m_initialTreeAmount; i++)
    {
        Entity newEntity = ecb.Instantiate(chunkIndex, prefabBuf.SelectRandom(forest.m_rng).prefab);

        //Use NextFloat because NextFloat2 doesn't do what you'd expect
        float randX = forest.m_rng.NextFloat(forest.m_cullRegionX.min, forest.m_cullRegionX.max);
        float randY = forest.m_rng.NextFloat(forest.m_cullRegionY.min, forest.m_cullRegionY.max);

        //No swizzling, they are spawned on XY plane
        float3 randPos3 = new float3(randX, randY, 0);
        float2 randPos2 = new float2(randX, randY);

        //Add a tree component: make this entity a tree
        ecb.AddComponent(chunkIndex, newEntity, new TreeComponent
        {
            m_age = 0,
            m_deathAge = forest.m_rng.NextUInt(forest.m_deathAge.min, forest.m_deathAge.max),
            m_matureAge = forest.m_rng.NextUInt(forest.m_matureAge.min, forest.m_matureAge.max),
            m_position = randPos2,
            m_needsCull = false,
            m_forestIndex = forest.m_forestIndex
        });

        //Set the position of the entity
        ecb.SetComponent<LocalTransform>(chunkIndex, newEntity, LocalTransform.FromPosition(randPos3));
    }
}
```

# Our results
We conducted a thorough analysis of our approach, comparing it to a traditionally serial implementation of the same algorithm. We found three main results:

- Our approach enables a $\approx 48.75$ times speed-up against a naive, serial $\mathcal{O}(n^2)$ algorithm.
- Parallelisation alone increased performance by $\approx 21.98$ times.
- Utilising ECS provides most performance benefits at a large-scale, with a large entity count. 

We listed a number of areas which could be explored in the future:

- Providing a more in-depth analysis of performance metrics between ECS and serial implementation could give a better idea, for example, of the optimum uniform grid size given $n$ entities.
- Investigating the optimum thread pool size would also be an interesting avenue for future work.
- Other spatial partitioning algorithms, e.g. k-d tree partitioning, would be another interesting aspect to consider -- our approach only uses uniform grid partitioning.

The paper itself provides a much more comprehensive breakdown of the results we found, so please check it out in September! Alternatively, check out our [open-source repository](https://github.com/StaffsUniGames/pcg-forests-ecs) if you want to get involved -- check out our trailer for a good summary of the main contributions our paper brings!

Below are some screenshots of the simulation. First, here's the 2D representation of a forest's growth using our approach:

![screen2](img/ecs-forests/2-screen-2.jpg)

And the same forest, but visualised in 3D:
![3D forest](img/ecs-forests/screen-1.jpg)

## Conclusion
To conclude, we provide a novel optimisation strategy for the simulation of virtual forestry in real-time. We primarily use Unity's Entities package (ECS), the parallelisable C# job scheduling system, and uniform spatial partitioning in our approach. The results from validating the approach shows dramatic ($\gt 40 \times$) performance benefits.

One thing we wanted to push in the paper was to introduce the wider field to the concept of ECS and the optimisation benefits it brings agent-oriented simulations. It is typical to see this divide between the commercial games sector and the literature. In our paper we hope to close this slightly, especially in the case of utilising ECS and data-orientation for real-time games. 

We hope to inspire future work which leverages ECS for optimising traditional algorithms. If you want to get in touch for collaboration on a paper or project, please reach out to me! 🙂