(() => {
  /**
   * Parse an ARN.
   *
   * @param arn
   * @returns {{accountId: *, partition: *, resource: string, service: *, region: *}}
   * @see https://github.com/aws/aws-sdk-js-v3/blob/main/packages/util-arn-parser/src/index.ts#L17
   */
  const parseArn = (arn) => {
    const segments = arn.split(":");
    if (segments.length < 6 || segments[0] !== "arn") throw new Error("Malformed ARN");
    const [
      ,
      //Skip "arn" literal
      partition,
      service,
      region,
      accountId,
      ...resource
    ] = segments;

    return {
      partition,
      service,
      region,
      accountId,
      resource: resource.join(":"),
    };
  };

  const copyToClipboard = (value) => {
    navigator.clipboard.writeText(value);
  };

  let timeout;
  const showToastMessage = (message) => {
    const toastElement = document.querySelector('#toast');
    clearTimeout(timeout);

    timeout = setTimeout(() => {
      toastElement.classList.add('hidden');
    }, 3000);

    document.querySelector('#toast-message').innerText = message;
    toastElement.classList.toggle('hidden', message === '');
  };

  const hideToastMessage = () => {
    showToastMessage('');
  };

  const processEcsTaskArn = (ecsTaskArn) => {
    const setCommandValue = (value) => {
      document.querySelector('#ecs-execute-command > code').innerText = value;
      document.querySelector('#ecs-execute-command').classList.toggle('hidden', value === '')
    };

    const generateCommand = (region, cluster, task, container, command = '/bin/sh', interactive = true) => {
      return `aws ecs execute-command --region ${region} --cluster ${cluster} --task ${task} --container ${container} --command ${command} ${interactive ? '--interactive' : ''}`
    };

    if (! ecsTaskArn.startsWith('arn:aws:ecs:')) {
      setCommandValue('');
      return;
    }

    const ARNParts = parseArn(ecsTaskArn);
    const [,cluster, taskId] = ARNParts.resource.split('/');

    setCommandValue(
      generateCommand(ARNParts.region, cluster, taskId, 'app')
    )
  };

  // Run the ECS Task ARN logic
  const ecsTaskArnInput = document.querySelector('#ecs-arn-task');
  ecsTaskArnInput.addEventListener('change', (event) => {
    processEcsTaskArn(event.target.value)
  });
  ecsTaskArnInput.addEventListener('keyup', (event) => {
    processEcsTaskArn(event.target.value)
  });
  document.querySelector('#ecs-execute-command').addEventListener('click', () => {
    copyToClipboard(document.querySelector("#ecs-execute-command > code").innerText);
    showToastMessage('✅ Copied to clipboard!');
  });
  processEcsTaskArn(ecsTaskArnInput.value);
})();
